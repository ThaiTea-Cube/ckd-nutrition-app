// Supabase Configuration
var SUPABASE_URL = 'https://moxhqycwvysohesnrlgr.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1veGhxeWN3dnlzb2hlc25ybGdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMTc1MDIsImV4cCI6MjA5OTU5MzUwMn0.zaslHTibVuEksW5i2LQMJqpKm9tVILh286Dd6uoL0mE';

// Create Supabase Client (safe re-declaration with var)
if (!window._supabaseClient) {
    window._supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}
var supabase = window._supabaseClient;
