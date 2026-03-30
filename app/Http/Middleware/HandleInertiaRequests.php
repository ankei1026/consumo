<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    // public function share(Request $request): array
    // {
    //     return [
    //         ...parent::share($request),
    //         'name' => config('app.name'),
    //         'auth' => [
    //             'user' => $request->user(),
    //         ],
    //     ];
    // }

    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user(),
            ],

            'notifications' => function () use ($request) {
                if (!$request->user()) {
                    return [
                        'unread' => [],
                        'count' => 0,
                    ];
                }

                return [
                    'unread' => $request->user()->unreadNotifications
                        ->map(function ($n) {
                            return [
                                'id' => $n->id,
                                'data' => $n->data,
                                'created_at' => $n->created_at->diffForHumans(),
                            ];
                        }),
                    'count' => $request->user()->unreadNotifications->count(),
                ];
            },
        ]);
    }
}
