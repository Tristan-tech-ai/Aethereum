<?php

$supabaseUrl = 'https://kbjxsfgumnddpkbkrswc.supabase.co';
$supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtianhzZmd1bW5kZHBrYmtyc3djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0OTI1MTAsImV4cCI6MjA4NzA2ODUxMH0.6WLsBVRIimEx01569CVuKzEGM4KjoPtQyBEUJJNZmew';

$users = [
    ['email' => 'tristan.lunar@gmail.com', 'password' => 'nexerapassword2026'],
    ['email' => 'putra.lunar@gmail.com', 'password' => 'nexerapassword2026'],
    ['email' => 'christian.lunar@gmail.com', 'password' => 'nexerapassword2026'],
];

foreach ($users as $user) {
    echo "Registering: {$user['email']}...\n";
    $ch = curl_init("{$supabaseUrl}/auth/v1/signup");
    
    $payload = json_encode([
        'email' => $user['email'],
        'password' => $user['password'],
    ]);
    
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'apikey: ' . $supabaseAnonKey,
        'Authorization: Bearer ' . $supabaseAnonKey,
    ]);
    
    $response = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "Status: {$status}\n";
    echo "Response: {$response}\n\n";
}
