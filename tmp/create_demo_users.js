const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kbjxsfgumnddpkbkrswc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtianhzZmd1bW5kZHBrYmtyc3djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0OTI1MTAsImV4cCI6MjA4NzA2ODUxMH0.6WLsBVRIimEx01569CVuKzEGM4KjoPtQyBEUJJNZmew';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const users = [
    { email: 'tristan.lunar@gmail.com', password: 'nexerapassword2026' },
    { email: 'putra.lunar@gmail.com', password: 'nexerapassword2026' },
    { email: 'christian.lunar@gmail.com', password: 'nexerapassword2026' }
];

async function createUsers() {
    for (const user of users) {
        console.log(`Creating user: ${user.email}`);
        const { data, error } = await supabase.auth.signUp({
            email: user.email,
            password: user.password,
        });
        if (error) {
            console.error(`Error for ${user.email}:`, error.message);
        } else {
            console.log(`Created: ${user.email} (ID: ${data.user?.id})`);
        }
    }
}

createUsers();
