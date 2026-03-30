<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Consumer extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $primaryKey = 'custcode';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'custcode',
        'account_number',
        'name',
        'mobile_number',
        'address',
        'meter_number',
        'connection_type',
        'status',
    ];

    protected $hidden = [
        'remember_token',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get all water consumption records for the consumer.
     */
    public function waterConsumptions()
    {
        return $this->hasMany(WaterConsumption::class, 'custcode', 'custcode');
    }

    /**
     * Get all reports for the consumer.
     */
    public function reports()
    {
        return $this->hasMany(Report::class, 'custcode', 'custcode');
    }

    /**
     * Get the latest water consumption record.
     */
    public function latestWaterConsumption()
    {
        return $this->hasOne(WaterConsumption::class, 'custcode', 'custcode')->latest();
    }

    /**
     * Get water consumption for a specific period.
     */
    public function getWaterConsumptionByPeriod($startDate, $endDate)
    {
        return $this->waterConsumptions()
            ->whereBetween('reading_date', [$startDate, $endDate])
            ->first();
    }

    /**
     * Find consumer for login using meter number + account number
     */
    public static function findForLogin($meterNumber, $accountNumber)
    {
        return self::where('meter_number', $meterNumber)
            ->where('account_number', $accountNumber)
            ->first();
    }
}
