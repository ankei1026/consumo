<?php

use App\Http\Controllers\Api\ConsumerAuthController;
use App\Http\Controllers\Api\ConsumerCustomerSupportController;
use App\Http\Controllers\Api\ConsumerPublicAdvisoryController;
use App\Http\Controllers\Api\ConsumerReportController;
use App\Http\Controllers\Api\ConsumerWaterConsumptionController;
use App\Http\Controllers\Api\SearchController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/api/search', [SearchController::class, 'search'])->name('api.search');

// Public consumer routes
Route::prefix('consumer')->group(function () {
    Route::post('/register', [ConsumerAuthController::class, 'register']);
    Route::post('/login', [ConsumerAuthController::class, 'login']);
});

// Protected consumer routes
Route::prefix('consumer')->middleware('auth:sanctum')->group(function () {
    // Authentication & Profile
    Route::post('/logout', [ConsumerAuthController::class, 'logout']);
    Route::get('/profile', [ConsumerAuthController::class, 'profile']);
    Route::put('/profile', [ConsumerAuthController::class, 'updateProfile']);

    // Advisory routes
    Route::get('/advisories', [ConsumerPublicAdvisoryController::class, 'index']);
    Route::get('/advisories/{id}', [ConsumerPublicAdvisoryController::class, 'show']);

    // Dashboard & Statistics
    Route::get('/dashboard', [ConsumerReportController::class, 'dashboard']);

    // Report routes
    Route::post('/reports', [ConsumerReportController::class, 'storeReport']);
    Route::get('/reports', [ConsumerReportController::class, 'getReports']);
    Route::get('/reports/{id}', [ConsumerReportController::class, 'showReport']);
    Route::get('/reports/{id}/analysis', [ConsumerReportController::class, 'getReportAnalysis']); // NEW ENDPOINT
    Route::put('/reports/{id}', [ConsumerReportController::class, 'updateReport']);
    Route::delete('/reports/{id}', [ConsumerReportController::class, 'deleteReport']);

    // Water consumption routes
    Route::get('/consumption-history', [ConsumerReportController::class, 'getWaterConsumptionHistory']);
    Route::get('/consumption/{id}', [ConsumerReportController::class, 'showWaterConsumption']);
    Route::get('/dashboard', [ConsumerReportController::class, 'dashboard']);

    // Water Consumption routes
    Route::get('/water-consumptions', [ConsumerWaterConsumptionController::class, 'index']);
    Route::get('/water-consumptions/{id}', [ConsumerWaterConsumptionController::class, 'show']);
    Route::get('/water-consumptions/current-month', [ConsumerWaterConsumptionController::class, 'getCurrentMonth']);
    Route::get('/water-consumptions/statistics', [ConsumerWaterConsumptionController::class, 'getStatistics']);
    Route::get('/water-consumptions/history', [ConsumerWaterConsumptionController::class, 'getHistory']);
    Route::get('/water-consumptions/latest', [ConsumerWaterConsumptionController::class, 'getLatest']);
    Route::get('/water-consumptions/trends', [ConsumerWaterConsumptionController::class, 'getTrends']);

    // Support tickets
    Route::get('/support-tickets', [ConsumerCustomerSupportController::class, 'index']);
    Route::post('/support-tickets', [ConsumerCustomerSupportController::class, 'store']);
    Route::get('/support-tickets/{id}', [ConsumerCustomerSupportController::class, 'show']);

});
