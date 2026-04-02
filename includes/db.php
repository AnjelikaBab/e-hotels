<?php
declare(strict_types=1);

function getDb(): mysqli
{
    static $db = null;

    if ($db instanceof mysqli) {
        return $db;
    }

    $host = getenv('DB_HOST') ?: '127.0.0.1';
    $user = getenv('DB_USER') ?: 'root';
    $pass = getenv('DB_PASS') ?: '';
    $name = getenv('DB_NAME') ?: 'e_hotels';
    $port = (int) (getenv('DB_PORT') ?: 3306);

    try {
        $db = @new mysqli($host, $user, $pass, $name, $port);
    } catch (mysqli_sql_exception $e) {
        throw new RuntimeException(
            "DB connection failed for database '{$name}' on {$host}:{$port}. " .
            "Create/import the database in phpMyAdmin first. Original error: " . $e->getMessage()
        );
    }

    if ($db->connect_errno) {
        throw new RuntimeException('DB connection failed: ' . $db->connect_error);
    }

    $db->set_charset('utf8mb4');
    return $db;
}

function fetchAll(mysqli_stmt $stmt): array
{
    $result = $stmt->get_result();
    return $result ? $result->fetch_all(MYSQLI_ASSOC) : [];
}
