<?php
// Include your local database connection
require './localconn.php';

// --- Configuration Constants ---
// Maximum number of rows allowed per CSV file partition
const MAX_ROWS_PER_CSV = 1000000;
// The specific DLR code that signifies a delivered message
const DELIVERED_DLR_CODE = '000';

// --- DLR Status Mapping Function (unchanged) ---
function getStatusReason($code)
{
    if (is_null($code) || trim($code) === '') {
        return 'Pending';
    }
    $map = [
        "000" => "Delivered",
        "100" => "Delivered",
        "2:000" => "Delivered",
        "201" => "Unknown Subscriber",
        "205" => "Unidentified Subscriber",
        "0dc" => "Absent Subscriber",
        "21b" => "Absent Subscriber",
        "023" => "Absent Subscriber",
        "027" => "Absent Subscriber",
        "053" => "Absent Subscriber",
        "054" => "Absent Subscriber",
        "058" => "Absent Subscriber",
        "206" => "Absent Subscriber (MT/SRI)",
        "602" => "Absent Subscriber (MT)",
        "20d" => "Call Barred / On DND",
        "525" => "Call barred as well",
        "439" => "Subscriber is barred",
        "130" => "Subscriber is barred on the network",
        "131" => "Subscriber is barred on the network",
        "21f" => "Subscriber Busy for MT",
        "215" => "Facility Not Supported",
        "254" => "Subscriber's phone inbox is full",
        "220" => "Subscriber's phone inbox is full",
        "120" => "Subscriber's phone inbox is full",
        "008" => "Subscriber's phone inbox is full",
        "0"   => "Subscriber's phone inbox is full",
        "407" => "MSC Timeout",
        "307" => "HLR Timeout",
        "222" => "Network System Failure",
        "306" => "Network System Failure",
        "032" => "Network operator system failure or operator not supported",
        "082" => "Network operator not supported",
        "40a" => "MAP Abort",
        "102" => "Tele service not provisioned",
        "20b" => "Tele service not provisioned",
        "600" => "Destination Acc ID IMSI barring",
        "065" => "Submit Error",
        "069" => "Submit Error",
        "72"  => "Wrong TON/NPI",
        "255" => "Inactive mobile number",
        "004" => "Inactive mobile number",
        "510" => "Ported mobile number",
        "085" => "Subscriber is on DND",
        "00a" => "SenderID is restricted by the operator",
        "078" => "Restricted message content or senderID is blocked.",
        "432" => "Restricted message content or senderID is blocked.",
    ];

    $code = strtolower(trim($code));
    return $map[$code] ?? 'Inactive Mobile Number';
}

// --- Date Range Setup (unchanged) ---
$fromDate = date("Y-m-d 00:00:00", strtotime("-13 day"));
$toDate   = date("Y-m-d 23:59:59", strtotime("-13 day"));

$dateRangeId = str_replace([' ', ':'], '-', $fromDate) . "_TO_" . str_replace([' ', ':'], '-', $toDate);

// --- Directory Setup ---
$baseReportDir   = __DIR__ . "/reports_" . date("Ymd");
$deliveredDir    = $baseReportDir . "/delivered";
$failedDir       = $baseReportDir . "/failed";
$zipFile         = $baseReportDir . ".zip";

// Ensure directories exist
if (!is_dir($deliveredDir)) {
    mkdir($deliveredDir, 0777, true);
}
if (!is_dir($failedDir)) {
    mkdir($failedDir, 0777, true);
}

// --- File Handling and Counters ---
$header = ['MSISDN', 'Network', 'Status', 'DLR Code', 'Reason', 'Created At', 'Updated At'];

$deliveredFileIndex = 1;
$failedFileIndex    = 1;
$deliveredCount     = 0;
$failedCount        = 0;

$deliveredHandle = null;
$failedHandle    = null;

/**
 * Closes the current file handle, and opens a new one for the given status/index.
 * @param resource $currentHandle The current file handle resource (passed by reference).
 * @param int $currentIndex The current file index (passed by reference).
 * @param string $directory The directory path (deliveredDir or failedDir).
 * @param string $statusName 'delivered' or 'failed'.
 * @param array $header The CSV header row.
 * @param string $dateRangeId The date range string for filename.
 * @return void
 */
function openNewCsvFile(&$currentHandle, &$currentIndex, $directory, $statusName, $header, $dateRangeId)
{
    if ($currentHandle) {
        fclose($currentHandle);
    }

    $filename = $directory . "/zenith_{$statusName}_part_" . $currentIndex . "_{$dateRangeId}.csv";
    $currentHandle = fopen($filename, "w");

    if (!$currentHandle) {
        die("FATAL: Unable to open file for writing: $filename");
    }

    // Write header to the new file
    fputcsv($currentHandle, $header);
}

// Open the initial CSV files
openNewCsvFile($deliveredHandle, $deliveredFileIndex, $deliveredDir, 'delivered', $header, $dateRangeId);
openNewCsvFile($failedHandle, $failedFileIndex, $failedDir, 'failed', $header, $dateRangeId);


// --- Query Execution ---
$sql = "SELECT msisdn, network, status, dlr_request, created_at, updated_at 
        FROM zenith_messages 
        WHERE created_at BETWEEN ? AND ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $fromDate, $toDate);
$stmt->execute();

// Use get_result() for MySQLi to allow iteration
$result = $stmt->get_result();

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $dlrCode = strtolower(trim($row['dlr_request']));
        $reason  = getStatusReason($dlrCode);

        $rowData = [
            $row['msisdn'],
            $row['network'],
            $row['status'],
            $dlrCode,
            $reason,
            $row['created_at'],
            $row['updated_at']
        ];

        if ($dlrCode === DELIVERED_DLR_CODE) {
            // --- Delivered Logic ---
            if ($deliveredCount >= MAX_ROWS_PER_CSV) {
                $deliveredFileIndex++;
                openNewCsvFile($deliveredHandle, $deliveredFileIndex, $deliveredDir, 'delivered', $header, $dateRangeId);
                $deliveredCount = 0; // Reset counter for the new file
            }
            fputcsv($deliveredHandle, $rowData);
            $deliveredCount++;
        } else {
            // --- Failed/Undelivered Logic ---
            if ($failedCount >= MAX_ROWS_PER_CSV) {
                $failedFileIndex++;
                openNewCsvFile($failedHandle, $failedFileIndex, $failedDir, 'failed', $header, $dateRangeId);
                $failedCount = 0; // Reset counter for the new file
            }
            fputcsv($failedHandle, $rowData);
            $failedCount++;
        }
    }
}

// --- Final Cleanup and Closure ---
if ($deliveredHandle) fclose($deliveredHandle);
if ($failedHandle) fclose($failedHandle);
$stmt->close();
$conn->close();

// --- Zipping Process ---
$zip = new ZipArchive();
if ($zip->open($zipFile, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== TRUE) {
    die("FATAL: Cannot create ZIP file: " . $zipFile);
}

// Function to add files recursively to the ZIP archive
$filesAdded = 0;
$recursiveAdd = function ($folder) use ($zip, &$filesAdded, &$recursiveAdd, $baseReportDir) {
    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($folder, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::SELF_FIRST
    );

    foreach ($iterator as $file) {
        $filePath = $file->getRealPath();
        // Get path relative to the base report directory
        $relativePath = substr($filePath, strlen($baseReportDir) + 1);

        if ($file->isDir()) {
            // Add directory to zip
            $zip->addEmptyDir($relativePath);
        } else {
            // Add file to zip
            $zip->addFile($filePath, $relativePath);
            $filesAdded++;
        }
    }
};

// Add the delivered and failed subdirectories to the zip
$recursiveAdd($deliveredDir);
$recursiveAdd($failedDir);

$zip->close();

echo "✅ Report generation complete.\n";
echo "Total Delivered Records: " . (($deliveredFileIndex - 1) * MAX_ROWS_PER_CSV + $deliveredCount) . " in {$deliveredFileIndex} files.\n";
echo "Total Failed Records: " . (($failedFileIndex - 1) * MAX_ROWS_PER_CSV + $failedCount) . " in {$failedFileIndex} files.\n";
echo "📦 All CSVs have been compressed into: $zipFile\n";
