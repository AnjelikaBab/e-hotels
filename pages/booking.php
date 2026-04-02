<?php
declare(strict_types=1);
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/layout.php';

$db = getDb();
$ok = null;
$err = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $hotelId = (int) ($_POST['hotel_id'] ?? 0);
        $roomId = (int) ($_POST['room_id'] ?? 0);
        $customerSsn = trim($_POST['customer_ssn'] ?? '');
        $start = $_POST['start_date'] ?? '';
        $end = $_POST['end_date'] ?? '';

        $stmt = $db->prepare("INSERT INTO Booking (Hotel_Id, Room_Id, Customer_SSN, Start_Date, End_Date)
                              VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param('iisss', $hotelId, $roomId, $customerSsn, $start, $end);
        $stmt->execute();
        $ok = 'Booking created successfully.';
    } catch (Throwable $t) {
        $err = $t->getMessage();
    }
}

pageHeader('Create Booking');
flash($ok, $err);
?>
<div class="card">
  <form method="post">
    <div class="row">
      <label>Hotel ID <input type="number" name="hotel_id" required></label>
      <label>Room ID <input type="number" name="room_id" required></label>
      <label>Customer SSN/SIN/ID <input type="text" name="customer_ssn" required></label>
      <label>Start date <input type="date" name="start_date" required></label>
      <label>End date <input type="date" name="end_date" required></label>
    </div>
    <button type="submit">Book room</button>
  </form>
</div>
<?php pageFooter(); ?>