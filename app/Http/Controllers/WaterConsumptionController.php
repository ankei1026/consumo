<?php

namespace App\Http\Controllers;

use App\Models\WaterConsumption;
use App\Models\Consumer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class WaterConsumptionController extends Controller
{
    /**
     * Display a listing of water consumptions.
     */
    // In WaterConsumptionController.php, update the index method:

    public function index(Request $request)
    {
        $search = $request->input('search', '');
        $dateFrom = $request->input('start_date'); // Changed from date_from to start_date
        $dateTo = $request->input('end_date'); // Changed from date_to to end_date
        $connectionType = $request->input('connection_type');

        $waterConsumptions = WaterConsumption::with('consumer')
            ->when($search, function ($query, $search) {
                $query->where('custcode', 'like', "%{$search}%")
                    ->orWhereHas('consumer', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            })
            ->when($dateFrom, function ($query, $dateFrom) {
                $query->whereDate('start_date', '=', $dateFrom); // Exact match for period filter
            })
            ->when($dateTo, function ($query, $dateTo) {
                $query->whereDate('end_date', '=', $dateTo);
            })
            ->when($connectionType && $connectionType !== 'all', function ($query) use ($connectionType) {
                $query->whereHas('consumer', function ($q) use ($connectionType) {
                    $q->where('connection_type', $connectionType);
                });
            })
            ->orderBy('start_date', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Get available months for the filter dropdown (you can generate a list of all available periods)
        $availableMonths = $this->getAllAvailableMonths();

        return Inertia::render('WaterConsumption/Index', [
            'waterConsumptions' => $waterConsumptions,
            'filters' => [
                'search' => $search,
                'start_date' => $dateFrom,
                'end_date' => $dateTo,
                'connection_type' => $connectionType,
            ],
            'availableMonths' => $availableMonths, // Pass available months to the view
        ]);
    }

    // Add this helper method to get all available months for filtering
    private function getAllAvailableMonths()
    {
        $months = [];
        $currentDate = Carbon::now();

        // Generate months for the last 2 years and next 2 years
        for ($i = -24; $i <= 24; $i++) {
            $date = $currentDate->copy()->addMonths($i);
            $year = $date->year;
            $month = $date->month;

            // Check if there are records for this period
            $hasRecords = WaterConsumption::whereYear('start_date', $year)
                ->whereMonth('start_date', $month)
                ->exists();

            // Only add if there are records or if it's a valid period
            if ($hasRecords || $i >= 0) {
                $period = $this->getReadingPeriodForMonth($year, $month);
                $months[] = [
                    'year' => $year,
                    'month' => $month,
                    'month_name' => $date->format('F'),
                    'start_date' => $period['start_date'],
                    'end_date' => $period['end_date'],
                    'display' => $period['display'],
                    'period' => $period['period'],
                    'has_records' => $hasRecords,
                ];
            }
        }

        return $months;
    }

    /**
     * Show the form for creating a new water consumption.
     */
    public function create()
    {
        $consumers = Consumer::select('custcode', 'name', 'address', 'connection_type', 'mobile_number', 'account_number', 'meter_number')
            ->orderBy('name')
            ->get();

        return Inertia::render('WaterConsumption/Create', [
            'consumers' => $consumers,
        ]);
    }

    /**
     * Get the 2nd day of a specific month and year
     */
    private function getSecondDayOfMonth($year, $month)
    {
        return Carbon::create($year, $month, 2)->format('Y-m-d');
    }

    /**
     * Get the end date (2nd day of next month)
     */
    private function getEndDate($startDate)
    {
        $date = Carbon::parse($startDate);
        return $date->addMonth()->setDay(2)->format('Y-m-d');
    }

    /**
     * Get the reading period for a specific month
     * For a given month, the reading period is from the 2nd of that month to the 2nd of the next month
     */
    private function getReadingPeriodForMonth($year, $month)
    {
        $startDate = $this->getSecondDayOfMonth($year, $month);
        $endDate = $this->getEndDate($startDate);

        return [
            'start_date' => $startDate,
            'end_date' => $endDate,
            'display' => Carbon::create($year, $month, 1)->format('F Y'),
            'period' => Carbon::parse($startDate)->format('M j') . ' → ' . Carbon::parse($endDate)->format('M j'),
        ];
    }

    /**
     * Get available reading months based on last reading
     */
    private function getAvailableReadingMonths($custcode)
    {
        $availableMonths = [];

        // Get last reading
        $lastReading = WaterConsumption::where('custcode', $custcode)
            ->orderBy('end_date', 'desc')
            ->first();

        $currentDate = Carbon::now();
        $startYear = $currentDate->year;
        $startMonth = $currentDate->month;

        // Adjust based on last reading
        if ($lastReading) {
            // Last reading's start date is the 2nd of some month
            $lastStartDate = Carbon::parse($lastReading->start_date);
            // Next reading should be the 2nd of next month
            $nextStartDate = $lastStartDate->copy()->addMonth();
            $startYear = $nextStartDate->year;
            $startMonth = $nextStartDate->month;
        } else {
            // No previous reading - if current date is after the 2nd, start from next month
            if ($currentDate->day > 2) {
                $nextMonth = $currentDate->copy()->addMonth();
                $startYear = $nextMonth->year;
                $startMonth = $nextMonth->month;
            } else {
                $startYear = $currentDate->year;
                $startMonth = $currentDate->month;
            }
        }

        // Generate next 24 months (2 years)
        for ($i = 0; $i < 24; $i++) {
            $year = $startYear;
            $month = $startMonth + $i;

            // Adjust year if month exceeds 12
            while ($month > 12) {
                $month -= 12;
                $year++;
            }

            $period = $this->getReadingPeriodForMonth($year, $month);

            // Only add if the reading date is not in the past
            if (Carbon::parse($period['start_date'])->isFuture() || Carbon::parse($period['start_date'])->isToday()) {
                $availableMonths[] = [
                    'year' => $year,
                    'month' => $month,
                    'month_name' => Carbon::create($year, $month, 1)->format('F'),
                    'start_date' => $period['start_date'],
                    'end_date' => $period['end_date'],
                    'display' => $period['display'],
                    'period' => $period['period'],
                ];
            }
        }

        return $availableMonths;
    }

    /**
     * Get last reading for a consumer.
     */
    public function getLastReading($custcode)
    {
        $lastReading = WaterConsumption::where('custcode', $custcode)
            ->orderBy('end_date', 'desc')
            ->first();

        $availableMonths = $this->getAvailableReadingMonths($custcode);

        // Set default selected month (first available)
        $defaultMonth = !empty($availableMonths) ? $availableMonths[0] : null;

        if ($lastReading) {
            return response()->json([
                'success' => true,
                'lastReading' => [
                    'current_reading' => $lastReading->current_reading,
                    'end_date' => $lastReading->end_date,
                    'start_date' => $lastReading->start_date,
                ],
                'availableMonths' => $availableMonths,
                'defaultMonth' => $defaultMonth,
                'hasPrevious' => true,
            ]);
        }

        return response()->json([
            'success' => true,
            'lastReading' => null,
            'availableMonths' => $availableMonths,
            'defaultMonth' => $defaultMonth,
            'hasPrevious' => false,
            'message' => 'No previous reading found. Starting from 0.'
        ]);
    }

    /**
     * Store a newly created water consumption.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'custcode' => 'required|exists:consumers,custcode',
            'current_reading' => 'required|numeric|min:0',
            'previous_reading' => 'required|numeric|min:0',
            'consumption' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        // Validate that current reading is greater than previous
        if ($validated['current_reading'] < $validated['previous_reading']) {
            return back()->withErrors([
                'current_reading' => 'Current reading must be greater than or equal to previous reading.'
            ]);
        }

        // Validate that start_date is the 2nd day of the month
        $startDate = Carbon::parse($validated['start_date']);
        if ($startDate->day != 2) {
            return back()->withErrors([
                'start_date' => 'Reading date must be on the 2nd day of the month.'
            ]);
        }

        // Validate that end_date is exactly one month after start_date (also on the 2nd)
        $expectedEndDate = $this->getEndDate($validated['start_date']);
        if ($validated['end_date'] !== $expectedEndDate) {
            return back()->withErrors([
                'end_date' => 'End date must be the 2nd day of the next month.'
            ]);
        }

        // Check for duplicate billing period
        $exists = WaterConsumption::where('custcode', $validated['custcode'])
            ->where(function ($query) use ($validated) {
                $query->where('start_date', $validated['start_date'])
                    ->orWhere('end_date', $validated['end_date']);
            })
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'start_date' => 'A record already exists for this billing period.'
            ]);
        }

        WaterConsumption::create($validated);

        return redirect()->route('water-consumptions.index')
            ->with('success', 'Water consumption record created successfully.');
    }

    /**
     * Display the specified water consumption.
     */
    public function show(WaterConsumption $waterConsumption)
    {
        $waterConsumption->load('consumer');

        return Inertia::render('WaterConsumption/Show', [
            'waterConsumption' => $waterConsumption,
        ]);
    }

    /**
     * Show the form for editing the specified water consumption.
     */
    public function edit(WaterConsumption $waterConsumption)
    {
        $waterConsumption->load('consumer');

        return Inertia::render('WaterConsumption/Edit', [
            'waterConsumption' => $waterConsumption,
        ]);
    }

    /**
     * Update the specified water consumption.
     */
    public function update(Request $request, WaterConsumption $waterConsumption)
    {
        $validated = $request->validate([
            'current_reading' => 'required|numeric|min:0',
            'previous_reading' => 'required|numeric|min:0',
            'consumption' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        // Validate that current reading is greater than previous
        if ($validated['current_reading'] < $validated['previous_reading']) {
            return back()->withErrors([
                'current_reading' => 'Current reading must be greater than or equal to previous reading.'
            ]);
        }

        // Validate that start_date is the 2nd day of the month
        $startDate = Carbon::parse($validated['start_date']);
        if ($startDate->day != 2) {
            return back()->withErrors([
                'start_date' => 'Reading date must be on the 2nd day of the month.'
            ]);
        }

        // Validate that end_date is exactly one month after start_date
        $expectedEndDate = $this->getEndDate($validated['start_date']);
        if ($validated['end_date'] !== $expectedEndDate) {
            return back()->withErrors([
                'end_date' => 'End date must be the 2nd day of the next month.'
            ]);
        }

        // Check for duplicate billing period excluding current record
        $exists = WaterConsumption::where('custcode', $waterConsumption->custcode)
            ->where('id', '!=', $waterConsumption->id)
            ->where(function ($query) use ($validated) {
                $query->where('start_date', $validated['start_date'])
                    ->orWhere('end_date', $validated['end_date']);
            })
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'start_date' => 'A record already exists for this billing period.'
            ]);
        }

        $waterConsumption->update($validated);

        return redirect()->route('water-consumptions.index')
            ->with('success', 'Water consumption record updated successfully.');
    }

    /**
     * Remove the specified water consumption.
     */
    public function destroy(WaterConsumption $waterConsumption)
    {
        $waterConsumption->delete();

        return redirect()->route('water-consumptions.index')
            ->with('success', 'Water consumption record deleted successfully.');
    }

    /**
     * Bulk delete water consumptions.
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:water_consumptions,id',
        ]);

        WaterConsumption::whereIn('id', $request->ids)->delete();

        return redirect()->back()
            ->with('success', 'Selected records deleted successfully.');
    }

    /**
     * Export water consumptions to CSV/Excel.
     */
    public function export(Request $request)
    {
        $search = $request->input('search', '');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $connectionType = $request->input('connection_type');

        $records = WaterConsumption::with('consumer')
            ->when($search, function ($query, $search) {
                $query->where('custcode', 'like', "%{$search}%")
                    ->orWhereHas('consumer', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            })
            ->when($dateFrom, function ($query, $dateFrom) {
                $query->whereDate('start_date', '>=', $dateFrom);
            })
            ->when($dateTo, function ($query, $dateTo) {
                $query->whereDate('end_date', '<=', $dateTo);
            })
            ->when($connectionType && $connectionType !== 'all', function ($query) use ($connectionType) {
                $query->whereHas('consumer', function ($q) use ($connectionType) {
                    $q->where('connection_type', $connectionType);
                });
            })
            ->orderBy('start_date', 'desc')
            ->get();

        $filename = "water_consumptions_" . now()->format('Y-m-d_H-i-s') . ".csv";
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function () use ($records) {
            $file = fopen('php://output', 'w');
            fwrite($file, "\xEF\xBB\xBF");

            fputcsv($file, [
                'ID',
                'Consumer Code',
                'Consumer Name',
                'Connection Type',
                'Previous Reading (m³)',
                'Current Reading (m³)',
                'Consumption (m³)',
                'Reading Date (Start)',
                'End Date',
                'Status',
                'Created At',
            ]);

            foreach ($records as $record) {
                $consumption = $record->consumption;
                $status = $consumption < 10 ? 'Low' : ($consumption < 30 ? 'Normal' : ($consumption < 50 ? 'High' : 'Critical'));

                fputcsv($file, [
                    $record->id,
                    $record->custcode,
                    $record->consumer->name ?? 'N/A',
                    $record->consumer->connection_type ?? 'N/A',
                    $record->previous_reading,
                    $record->current_reading,
                    $record->consumption,
                    Carbon::parse($record->start_date)->format('F j, Y'),
                    Carbon::parse($record->end_date)->format('F j, Y'),
                    $status,
                    Carbon::parse($record->created_at)->format('F j, Y H:i:s'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

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
        $expectedHeaders = ['custcode', 'previous_reading', 'current_reading', 'start_date', 'end_date'];

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

        // If there are missing required headers, return error
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
                    $data[$field] = $row[$index];
                } else {
                    $data[$field] = '';
                }
            }

            // Validate that custcode exists
            $consumer = Consumer::where('custcode', $data['custcode'])->first();
            if (!$consumer) {
                $errors[] = "Row {$rowNumber}: Consumer code '{$data['custcode']}' not found";
                $errorCount++;
                continue;
            }

            // Convert readings to numeric values
            $previousReading = (float) $data['previous_reading'];
            $currentReading = (float) $data['current_reading'];

            // Validate readings
            if ($currentReading < $previousReading) {
                $errors[] = "Row {$rowNumber}: Current reading ({$currentReading}) cannot be less than previous reading ({$previousReading})";
                $errorCount++;
                continue;
            }

            // Calculate consumption
            $consumption = $currentReading - $previousReading;

            // Validate dates
            $startDate = Carbon::parse($data['start_date']);
            $endDate = Carbon::parse($data['end_date']);

            // Validate that start_date is the 2nd day of the month
            if ($startDate->day != 2) {
                $errors[] = "Row {$rowNumber}: Start date must be on the 2nd day of the month. Got: {$data['start_date']}";
                $errorCount++;
                continue;
            }

            // Validate that end_date is exactly one month after start_date
            $expectedEndDate = $startDate->copy()->addMonth()->setDay(2);
            if (!$endDate->isSameDay($expectedEndDate)) {
                $errors[] = "Row {$rowNumber}: End date must be the 2nd day of the next month. Expected: {$expectedEndDate->format('Y-m-d')}, Got: {$data['end_date']}";
                $errorCount++;
                continue;
            }

            // Check for duplicate billing period
            $exists = WaterConsumption::where('custcode', $data['custcode'])
                ->where(function ($query) use ($startDate, $endDate) {
                    $query->where('start_date', $startDate->format('Y-m-d'))
                        ->orWhere('end_date', $endDate->format('Y-m-d'));
                })
                ->exists();

            if ($exists) {
                $errors[] = "Row {$rowNumber}: A record already exists for this billing period (Custcode: {$data['custcode']}, Period: {$startDate->format('Y-m-d')} to {$endDate->format('Y-m-d')})";
                $errorCount++;
                continue;
            }

            try {
                WaterConsumption::create([
                    'custcode' => $data['custcode'],
                    'previous_reading' => $previousReading,
                    'current_reading' => $currentReading,
                    'consumption' => $consumption,
                    'start_date' => $startDate->format('Y-m-d'),
                    'end_date' => $endDate->format('Y-m-d'),
                ]);
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
            return redirect()->route('water-consumptions.index')->with('success', $message);
        } else {
            return back()->withErrors(['error' => $message]);
        }
    }
}
