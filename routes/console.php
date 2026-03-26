<?php

use App\Jobs\CleanupInactiveRoomMembersJob;
use App\Jobs\ExpirePendingDuelsJob;
use App\Jobs\WeeklyChallengeResetJob;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::job(new ExpirePendingDuelsJob)->hourly();
Schedule::job(new WeeklyChallengeResetJob)->weeklyOn(1, '00:00');
Schedule::job(new CleanupInactiveRoomMembersJob)->everyFiveMinutes();
