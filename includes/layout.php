<?php
declare(strict_types=1);

function h(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

function pageHeader(string $title): void
{
    echo '<!doctype html><html><head><meta charset="utf-8">';
    echo '<meta name="viewport" content="width=device-width, initial-scale=1">';
    echo '<title>' . h($title) . '</title>';
    echo '<style>
        body{font-family:Arial,sans-serif;max-width:1100px;margin:1.5rem auto;padding:0 1rem;background:#fafafa}
        nav a{margin-right:.8rem}
        .card{background:#fff;padding:1rem;border:1px solid #ddd;border-radius:8px;margin:1rem 0}
        table{width:100%;border-collapse:collapse}
        th,td{padding:.5rem;border:1px solid #ddd;text-align:left}
        label{display:block;margin:.4rem 0}
        input,select{padding:.35rem;min-width:220px}
        .row{display:flex;gap:1rem;flex-wrap:wrap}
        .msg{padding:.7rem;border-radius:6px;margin:.7rem 0}
        .ok{background:#e8f8ef;border:1px solid #98dfb0}
        .err{background:#fdeaea;border:1px solid #f4a1a1}
        .small{font-size:.9rem;color:#555}
    </style>';
    echo '</head><body>';
    echo '<h1>' . h($title) . '</h1>';
    echo '<nav>
        <a href="/index.php">Home</a>
        <a href="/pages/search.php">Search</a>
        <a href="/pages/booking.php">Booking</a>
        <a href="/pages/renting.php">Renting</a>
        <a href="/pages/payment.php">Payment</a>
        <a href="/pages/views.php">Views</a>
        <a href="/crud/customers.php">Customers</a>
        <a href="/crud/employees.php">Employees</a>
        <a href="/crud/hotels.php">Hotels</a>
        <a href="/crud/rooms.php">Rooms</a>
    </nav><hr>';
}

function pageFooter(): void
{
    echo '</body></html>';
}

function flash(?string $ok, ?string $err): void
{
    if ($ok) {
        echo '<div class="msg ok">' . h($ok) . '</div>';
    }
    if ($err) {
        echo '<div class="msg err">' . h($err) . '</div>';
    }
}
