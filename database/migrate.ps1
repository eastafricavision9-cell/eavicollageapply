# Migration script for Supabase
# Run this script to apply the admission counter migration

Write-Host "=== Supabase Migration Script ===" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Supabase CLI not found!" -ForegroundColor Red
    Write-Host "Please install Supabase CLI first:" -ForegroundColor Yellow
    Write-Host "npm install -g supabase" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Or run the SQL directly in your Supabase dashboard." -ForegroundColor Yellow
    exit 1
}

# Get the directory of this script
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$migrationFile = Join-Path $scriptDir "migrations\001_admission_counter.sql"

# Check if migration file exists
if (-not (Test-Path $migrationFile)) {
    Write-Host "❌ Migration file not found: $migrationFile" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Migration file found: $migrationFile" -ForegroundColor Green

# Prompt for confirmation
Write-Host ""
Write-Host "This will run the admission counter migration on your Supabase database." -ForegroundColor Yellow
Write-Host "Make sure you have:" -ForegroundColor Yellow
Write-Host "  ✓ Backed up your database" -ForegroundColor Yellow  
Write-Host "  ✓ Connected to the correct Supabase project" -ForegroundColor Yellow
Write-Host ""

$confirmation = Read-Host "Do you want to continue? (y/N)"
if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
    Write-Host "Migration cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🚀 Running migration..." -ForegroundColor Cyan

try {
    # Run the migration using Supabase CLI
    $result = supabase db push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Migration completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "The following has been created:" -ForegroundColor Cyan
        Write-Host "  • admission_counter table" -ForegroundColor White
        Write-Host "  • get_next_admission_number() function" -ForegroundColor White
        Write-Host "  • initialize_admission_counter() function" -ForegroundColor White
        Write-Host "  • get_admission_counter_status() function" -ForegroundColor White
        Write-Host "  • validate_admission_number() function" -ForegroundColor White
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "  1. Go to your admin dashboard" -ForegroundColor White
        Write-Host "  2. Open Settings" -ForegroundColor White
        Write-Host "  3. Set your desired admission starting number" -ForegroundColor White
        Write-Host "  4. Save settings to initialize the counter" -ForegroundColor White
    } else {
        Write-Host "❌ Migration failed! Exit code: $LASTEXITCODE" -ForegroundColor Red
        Write-Host "Please check the error messages above." -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error running migration: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Alternative: Run the SQL directly" -ForegroundColor Yellow
    Write-Host "  1. Copy the contents of: $migrationFile" -ForegroundColor White
    Write-Host "  2. Go to your Supabase dashboard" -ForegroundColor White
    Write-Host "  3. Navigate to SQL Editor" -ForegroundColor White
    Write-Host "  4. Paste and run the SQL" -ForegroundColor White
}

Write-Host ""
Write-Host "Migration script completed." -ForegroundColor Cyan