# Admission Number System

This system provides automatic admission number generation for East Africa Vision Institute (EAVI) with database integrity and consistency.

## Overview

The admission number system consists of:
- **Database Table**: `admission_counter` - Tracks the current admission number state
- **SQL Functions**: Safe number generation with proper locking
- **Admin Interface**: Settings to configure starting numbers
- **Service Layer**: TypeScript methods for easy integration

## Features

✅ **Thread-Safe Generation**: Uses PostgreSQL row locking to prevent race conditions  
✅ **Configurable Starting Number**: Admin can set custom starting points  
✅ **Format Validation**: Ensures admission numbers follow the correct pattern  
✅ **Atomic Operations**: Database transactions ensure data integrity  
✅ **Audit Trail**: Tracks when the counter was last updated  

## Admission Number Format

**Format**: `EAVI` + `0000` (4-digit padded number)

**Examples**:
- `EAVI1000` (starting number: 1000)
- `EAVI1001` (next number)
- `EAVI2500` (starting number: 2500)

## Database Schema

### Table: `admission_counter`

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Always `1` (singleton pattern) |
| `current_number` | INTEGER | Last used admission number |
| `prefix` | VARCHAR(10) | Prefix for admission numbers (default: "EAVI") |
| `created_at` | TIMESTAMP | When record was created |
| `updated_at` | TIMESTAMP | When counter was last updated |
| `updated_by` | UUID | User who last updated (optional) |

### Functions

#### `get_next_admission_number()`
Safely generates and returns the next admission number.
- **Returns**: `TEXT` - Formatted admission number (e.g., "EAVI1001")
- **Thread-Safe**: Uses `FOR UPDATE` locking
- **Atomic**: Updates counter in same transaction

#### `initialize_admission_counter(starting_number, new_prefix)`
Initializes or resets the admission counter.
- **Parameters**: 
  - `starting_number` (INTEGER): Starting point for numbering
  - `new_prefix` (VARCHAR, optional): Prefix for admission numbers
- **Returns**: `BOOLEAN` - Success status
- **Validation**: Ensures starting number is positive

#### `get_admission_counter_status()`
Returns current counter status and preview of next number.
- **Returns**: Table with current state information

#### `validate_admission_number(admission_num)`
Validates admission number format.
- **Parameters**: `admission_num` (TEXT): Number to validate
- **Returns**: `BOOLEAN` - Whether format is valid

## Installation

### Method 1: Using PowerShell Script (Recommended)

```powershell
# Run from project root
.\database\migrate.ps1
```

### Method 2: Manual SQL Execution

1. Copy contents of `database/migrations/001_admission_counter.sql`
2. Go to Supabase Dashboard → SQL Editor
3. Paste and run the SQL

### Method 3: Supabase CLI

```bash
# Make sure you're connected to your project
supabase db push
```

## Configuration

After running the migration:

1. **Go to Admin Dashboard** → Settings
2. **Set Admission Starting Number** (e.g., 1000, 2500)
3. **Save Settings** - This initializes the counter
4. **Verify**: Check that new students get auto-generated numbers

## Usage in Code

### Auto-Generate Admission Numbers

```typescript
// Create student with auto-generated admission number
const student = await SupabaseService.createStudentWithAutoAdmission({
  full_name: "John Doe",
  phone: "+254712345678",
  course: "Certificate in Information Technology",
  status: "Pending",
  // admission_number will be generated automatically
})

console.log(student.admission_number) // "EAVI1001"
```

### Manual Admission Number Generation

```typescript
// Get next admission number without creating student
const admissionNumber = await SupabaseService.getNextAdmissionNumber()
console.log(admissionNumber) // "EAVI1002"
```

### Check Counter Status

```typescript
const status = await SupabaseService.getAdmissionCounterStatus()
console.log({
  current: status.current_number,    // 1001
  prefix: status.prefix,             // "EAVI"
  nextNumber: status.next_number,    // "EAVI1002"
  lastUpdated: status.last_updated   // timestamp
})
```

### Validate Admission Number

```typescript
const isValid = await SupabaseService.validateAdmissionNumber("EAVI1001")
console.log(isValid) // true or false
```

## Security & Permissions

- **Row Level Security (RLS)**: Enabled on `admission_counter` table
- **Function Security**: `SECURITY DEFINER` ensures proper execution
- **User Permissions**: Only authenticated users can access functions
- **Admin Controls**: Counter initialization requires admin privileges

## Error Handling

The system includes comprehensive error handling:

- **Race Conditions**: Prevented by database-level locking
- **Invalid Numbers**: Validation functions check format
- **Transaction Failures**: Atomic operations ensure consistency
- **Logging**: All operations are logged for debugging

## Troubleshooting

### Problem: Migration fails
**Solution**: Run SQL manually in Supabase dashboard

### Problem: Counter not initializing
**Solution**: Check admin settings save function and database permissions

### Problem: Duplicate admission numbers
**Solution**: This shouldn't happen due to row locking, but check for concurrent transaction issues

### Problem: Invalid format
**Solution**: Use validation function to check admission number format

## Maintenance

### Backing Up Counter State
```sql
-- Export current counter state
SELECT * FROM admission_counter WHERE id = 1;
```

### Resetting Counter (Advanced)
```sql
-- Reset to new starting number (use with caution!)
SELECT initialize_admission_counter(5000, 'EAVI');
```

### Monitoring Usage
```sql
-- Check recent counter updates
SELECT current_number, updated_at, updated_by 
FROM admission_counter 
WHERE id = 1;
```

## Support

For issues with the admission number system:

1. Check the browser console for errors
2. Verify database migration was successful
3. Ensure proper permissions in Supabase
4. Check that admin settings are saved correctly

## Technical Notes

- **Database**: PostgreSQL (Supabase)
- **Concurrency**: Row-level locking prevents race conditions
- **Performance**: Optimized for high-concurrency environments
- **Scalability**: Can handle thousands of simultaneous requests
- **Backup**: Counter state should be included in database backups