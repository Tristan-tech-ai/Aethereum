<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    $emails = [
        'tristan.lunar@gmail.com',
        'putra.lunar@gmail.com',
        'christian.lunar@gmail.com'
    ];
    
    $emailsStr = "'" . implode("','", $emails) . "'";
    
    DB::statement("UPDATE auth.users SET email_confirmed_at = now(), last_sign_in_at = now() WHERE email IN ($emailsStr)");
    
    echo "Auth confirmation successful.\n";
    
    // Get the IDs
    $ids = DB::table('auth.users')->whereIn('email', $emails)->select('id', 'email')->get();
    foreach ($ids as $user) {
        echo "Mapping: {$user->email} => {$user->id}\n";
    }

} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
