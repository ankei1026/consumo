<?php
// app/Http/Controllers/ConsumerController.php

namespace App\Http\Controllers;

use App\Models\Consumer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ConsumerController extends Controller
{
    /**
     * Display a listing of consumers.
     */
    public function index()
    {
        $consumers = Consumer::latest()->paginate(10);

        return Inertia::render('Consumer/Index', [
            'consumers' => $consumers
        ]);
    }

    /**
     * Show the form for creating a new consumer.
     */
    public function create()
    {
        return Inertia::render('Consumer/Create');
    }

    /**
     * Store a newly created consumer in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'custcode' => 'required|string|max:10|unique:consumers',
            'account_number' => 'required|string|max:20|unique:consumers',
            'name' => 'required|string|max:255',
            'mobile_number' => 'required|string|max:20|unique:consumers',
            'address' => 'nullable|string|max:500',
            'meter_number' => 'required|string|max:20|unique:consumers',
            'connection_type' => 'required|in:residential,commercial,institutional',
        ]);

        try {
            $consumer = Consumer::create($validated + ['status' => 'active']);

            Log::info('Consumer created', [
                'custcode' => $consumer->custcode,
                'account_number' => $consumer->account_number,
                'meter_number' => $consumer->meter_number
            ]);

            return redirect()->route('consumers.index')
                ->with('success', "Consumer created successfully. Code: {$consumer->custcode}, Account: {$consumer->account_number}");
        } catch (\Exception $e) {
            Log::error('Consumer creation failed', ['error' => $e->getMessage()]);
            return back()->withErrors(['error' => 'Failed to create consumer. ' . $e->getMessage()]);
        }
    }

    /**
     * Import consumers from CSV file
     */
    public function import(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt|max:2048',
        ]);

        $file = $request->file('csv_file');
        $path = $file->getRealPath();

        $handle = fopen($path, 'r');

        // Get headers and clean them
        $headers = fgetcsv($handle);
        $headers = array_map('trim', $headers);
        $headers = array_map('strtolower', $headers);

        // Expected headers mapping
        $expectedHeaders = ['custcode', 'account_number', 'name', 'mobile_number', 'address', 'meter_number', 'connection_type'];

        // Map headers to expected fields
        $headerMapping = [];
        $missingHeaders = [];

        foreach ($expectedHeaders as $expected) {
            $found = false;
            foreach ($headers as $index => $header) {
                if ($header === $expected || str_contains($header, $expected)) {
                    $headerMapping[$expected] = $index;
                    $found = true;
                    break;
                }
            }
            if (!$found) {
                $missingHeaders[] = $expected;
            }
        }

        // If custcode is missing, we'll generate it
        if (in_array('custcode', $missingHeaders)) {
            $missingHeaders = array_diff($missingHeaders, ['custcode']);
        }

        // If there are other missing required headers, return error
        if (!empty($missingHeaders)) {
            fclose($handle);
            return back()->withErrors(['error' => 'Missing required columns: ' . implode(', ', $missingHeaders)]);
        }

        $successCount = 0;
        $errorCount = 0;
        $errors = [];
        $rowNumber = 1;

        while (($row = fgetcsv($handle)) !== false) {
            $rowNumber++;

            // Clean row data
            $row = array_map('trim', $row);

            // Skip empty rows
            if (empty(array_filter($row))) {
                continue;
            }

            // Build data array using header mapping indices
            $data = [];

            // Map standard fields using the index from headerMapping
            foreach ($headerMapping as $field => $index) {
                if (isset($row[$index])) {
                    // Convert empty strings to null for nullable fields
                    if ($field === 'address' && $row[$index] === '') {
                        $data[$field] = null;
                    } else {
                        $data[$field] = $row[$index];
                    }
                } else {
                    // Set default values for missing fields
                    if ($field === 'address') {
                        $data[$field] = null;
                    } elseif ($field === 'connection_type') {
                        $data[$field] = 'residential';
                    } else {
                        $data[$field] = '';
                    }
                }
            }

            // Handle custcode if not present in CSV or empty
            if (!isset($data['custcode']) || empty($data['custcode'])) {
                $data['custcode'] = str_pad($rowNumber, 5, '0', STR_PAD_LEFT);
            }

            // Handle empty mobile_number - set to null if empty string
            if (isset($data['mobile_number']) && $data['mobile_number'] === '') {
                $data['mobile_number'] = null;
            }

            // Handle empty address - set to null if empty string
            if (isset($data['address']) && $data['address'] === '') {
                $data['address'] = null;
            }

            // Handle connection_type - default to residential if empty or not set
            if (!isset($data['connection_type']) || empty($data['connection_type'])) {
                $data['connection_type'] = 'residential';
            } else {
                $data['connection_type'] = strtolower(trim($data['connection_type']));
            }

            // Ensure all required fields have values
            $data['name'] = $data['name'] ?? '';
            $data['meter_number'] = $data['meter_number'] ?? '';
            $data['status'] = 'active';

            // Skip if critical fields are empty
            if (empty($data['name']) || empty($data['meter_number'])) {
                $errors[] = "Row {$rowNumber}: Missing required data (name or meter_number)";
                $errorCount++;
                continue;
            }

            // Skip if account number is empty
            if (empty($data['account_number'])) {
                $errors[] = "Row {$rowNumber}: Missing account_number";
                $errorCount++;
                continue;
            }

            // Validate each row
            $validator = Validator::make($data, [
                'custcode' => 'required|string|max:10|unique:consumers,custcode',
                'account_number' => 'required|string|max:20|unique:consumers,account_number',
                'name' => 'required|string|max:255',
                'mobile_number' => 'nullable|string|max:20|unique:consumers,mobile_number',
                'meter_number' => 'required|string|max:20|unique:consumers,meter_number',
                'connection_type' => 'required|in:residential,commercial,institutional',
                'address' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                $errors[] = "Row {$rowNumber}: " . implode(', ', $validator->errors()->all());
                $errorCount++;
                continue;
            }

            try {
                Consumer::create($data);
                $successCount++;
            } catch (\Exception $e) {
                $errors[] = "Row {$rowNumber}: " . $e->getMessage();
                $errorCount++;
            }
        }

        fclose($handle);

        // Build response message
        $message = "Import completed: {$successCount} records imported successfully.";
        if ($errorCount > 0) {
            $message .= " {$errorCount} records failed.";
            if (count($errors) > 0) {
                $message .= " " . implode('; ', array_slice($errors, 0, 10));
                if (count($errors) > 10) {
                    $message .= " and " . (count($errors) - 10) . " more errors.";
                }
            }
        }

        if ($successCount > 0) {
            return redirect()->route('consumers.index')->with('success', $message);
        } else {
            return back()->withErrors(['error' => $message]);
        }
    }

    /**
     * Display the specified consumer.
     */
    public function show(Consumer $consumer)
    {
        return Inertia::render('Consumer/Show', [
            'consumer' => $consumer
        ]);
    }

    /**
     * Show the form for editing the specified consumer.
     */
    public function edit(Consumer $consumer)
    {
        return Inertia::render('Consumer/Edit', [
            'consumer' => $consumer
        ]);
    }

    /**
     * Update the specified consumer in storage.
     */
    public function update(Request $request, Consumer $consumer)
    {
        // Build validation rules dynamically based on what fields are present
        $rules = [];

        if ($request->has('custcode')) {
            $rules['custcode'] = 'required|string|max:10|unique:consumers,custcode,' . $consumer->custcode . ',custcode';
        }

        if ($request->has('account_number')) {
            $rules['account_number'] = 'required|string|max:20|unique:consumers,account_number,' . $consumer->custcode . ',custcode';
        }

        if ($request->has('name')) {
            $rules['name'] = 'required|string|max:255';
        }

        if ($request->has('mobile_number')) {
            $rules['mobile_number'] = 'nullable|string|max:20|unique:consumers,mobile_number,' . $consumer->custcode . ',custcode';
        }

        if ($request->has('address')) {
            $rules['address'] = 'nullable|string|max:500';
        }

        if ($request->has('meter_number')) {
            $rules['meter_number'] = 'required|string|max:20|unique:consumers,meter_number,' . $consumer->custcode . ',custcode';
        }

        if ($request->has('connection_type')) {
            $rules['connection_type'] = 'required|in:residential,commercial,institutional';
        }

        if ($request->has('status')) {
            $rules['status'] = 'required|in:active,inactive';
        }

        // If no fields to update, return error
        if (empty($rules)) {
            return response()->json([
                'success' => false,
                'message' => 'No fields to update'
            ], 422);
        }

        $validated = $request->validate($rules);

        $consumer->update($validated);

        // If this is an API request (like from the status toggle), return JSON
        if ($request->wantsJson() || $request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Consumer updated successfully.',
                'data' => $consumer
            ]);
        }

        // Otherwise, redirect for web requests
        return redirect()->route('consumers.index')
            ->with('success', 'Consumer updated successfully.');
    }

    /**
     * Remove the specified consumer from storage.
     */
    public function destroy(Consumer $consumer)
    {
        $consumer->delete();

        return redirect()->route('consumers.index')
            ->with('success', 'Consumer deleted successfully.');
    }
}
