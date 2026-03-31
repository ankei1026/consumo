<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ConsumerController;
use App\Http\Controllers\CustomerSupportController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicAdvisoryController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\WaterConsumptionController;
use Inertia\Inertia;

Route::get('/', function () {
    return inertia('welcome');
})->name('home');

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware(['auth', 'admin'])->group(function () {
    Route::post('/notifications/mark-all-read', function () {
        auth()->user()->unreadNotifications->markAsRead();
        return back();
    });

    Route::post('/notifications/{id}/read', function ($id) {
        $notification = auth()->user()
            ->notifications()
            ->where('id', $id)
            ->first();

        if ($notification) {
            $notification->markAsRead();
        }

        return response()->json(['success' => true]);
    });

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Consumer Management Routes
    Route::get('/consumers', [ConsumerController::class, 'index'])->name('consumers.index');
    Route::get('/consumers/create', [ConsumerController::class, 'create'])->name('consumers.create');
    Route::post('/consumers', [ConsumerController::class, 'store'])->name('consumers.store');
    Route::get('/consumers/{consumer}', [ConsumerController::class, 'show'])->name('consumers.show');
    Route::get('/consumers/{consumer}/edit', [ConsumerController::class, 'edit'])->name('consumers.edit');
    Route::put('/consumers/{consumer}', [ConsumerController::class, 'update'])->name('consumers.update');
    Route::delete('/consumers/{consumer}', [ConsumerController::class, 'destroy'])->name('consumers.destroy');
    Route::post('/consumers/import', [ConsumerController::class, 'import'])->name('consumers.import');


    Route::prefix('public-advisories')->name('public-advisories.')->group(function () {
        Route::get('/', [PublicAdvisoryController::class, 'index'])->name('index');
        Route::get('/create', [PublicAdvisoryController::class, 'create'])->name('create');
        Route::post('/', [PublicAdvisoryController::class, 'store'])->name('store');
        Route::get('/{publicAdvisory}', [PublicAdvisoryController::class, 'show'])->name('show');
        Route::get('/{publicAdvisory}/edit', [PublicAdvisoryController::class, 'edit'])->name('edit');
        Route::put('/{publicAdvisory}', [PublicAdvisoryController::class, 'update'])->name('update');
        Route::delete('/{publicAdvisory}', [PublicAdvisoryController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('water-consumptions')->group(function () {
        Route::get('/', [WaterConsumptionController::class, 'index'])->name('water-consumptions.index');
        Route::get('/create', [WaterConsumptionController::class, 'create'])->name('water-consumptions.create');
        Route::post('/', [WaterConsumptionController::class, 'store'])->name('water-consumptions.store');
        Route::get('/last-reading/{custcode}', [WaterConsumptionController::class, 'getLastReading']);
        Route::get('/export', [WaterConsumptionController::class, 'export'])->name('water-consumptions.export');
        Route::post('/bulk-delete', [WaterConsumptionController::class, 'bulkDelete'])->name('water-consumptions.bulk-delete');
        Route::post('/import', [WaterConsumptionController::class, 'import'])->name('water-consumptions.import');
        Route::get('/{waterConsumption}', [WaterConsumptionController::class, 'show'])->name('water-consumptions.show');
        Route::get('/{waterConsumption}/edit', [WaterConsumptionController::class, 'edit'])->name('water-consumptions.edit');
        Route::put('/{waterConsumption}', [WaterConsumptionController::class, 'update'])->name('water-consumptions.update');
        Route::delete('/{waterConsumption}', [WaterConsumptionController::class, 'destroy'])->name('water-consumptions.destroy');
    });

    Route::get('/customer-support', [CustomerSupportController::class, 'index'])
        ->name('customer-support.index');
    Route::get('/customer-support/{id}', [CustomerSupportController::class, 'show'])
        ->name('customer-support.show');
    Route::patch('/customer-support/{id}', [CustomerSupportController::class, 'update'])
        ->name('customer-support.update');
    Route::delete('/customer-support/{id}', [CustomerSupportController::class, 'destroy'])
        ->name('customer-support.destroy');

    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/{id}', [ReportController::class, 'show'])->name('reports.show');
    Route::get('/reports/{id}/analysis', [ReportController::class, 'getAnalysis'])->name('reports.analysis');
    Route::post('/reports/filter', [ReportController::class, 'filterByAnalysis'])->name('reports.filter');
    Route::post('/reports/{id}/retry-analysis', [ReportController::class, 'retryAnalysis']);
    Route::put('/reports/{id}/status', [ReportController::class, 'updateStatus'])->name('reports.update-status');

    Route::get('/profile', [ProfileController::class, 'index'])->name('profile.index');
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');

    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
});
