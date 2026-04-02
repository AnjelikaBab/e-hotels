<?php
declare(strict_types=1);
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/layout.php';

$db = getDb();
$ok = null;
$err = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    try {
        if ($action === 'from_booking') {
            $bookingId = (int) ($_POST['booking_id'] ?? 0);
            $employee = trim($_POST['employee_ssn'] ?? '');

            $db->begin_transaction();
            $stmt = $db->prepare("SELECT Hotel_Id, Room_Id, Customer_SSN, Start_Date, End_Date
                                  FROM Booking WHERE Booking_Id = ? AND Booking_Status = 'active'");
            $stmt->bind_param('i', $bookingId);
            $stmt->execute();
            $booking = $stmt->get_result()->fetch_assoc();
            if (!$booking) {
                throw new RuntimeException('Active booking not found.');
            }

            $stmt = $db->prepare("INSERT INTO Renting (Booking_Id, Hotel_Id, Room_Id, Customer_SSN, Employee_SSN, Start_Date, End_Date)
                                  VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->bind_param(
                'iiissss',
                $bookingId,
                $booking['Hotel_Id'],
                $booking['Room_Id'],
                $booking['Customer_SSN'],
                $employee,
                $booking['Start_Date'],
                $booking['End_Date']
            );
            $stmt->execute();

            $stmt = $db->prepare("UPDATE Booking SET Booking_Status = 'completed' WHERE Booking_Id = ?");
            $stmt->bind_param('i', $bookingId);
            $stmt->execute();
            $db->commit();
            $ok = 'Booking transformed to renting.';
        } elseif ($action === 'direct_rent') {
            $hotelId = (int) ($_POST['hotel_id'] ?? 0);
            $roomId = (int) ($_POST['room_id'] ?? 0);
            $customer = trim($_POST['customer_ssn'] ?? '');
            $employee = trim($_POST['employee_ssn'] ?? '');
            $start = $_POST['start_date'] ?? '';
            $end = $_POST['end_date'] ?? '';

            $stmt = $db->prepare("INSERT INTO Renting (Hotel_Id, Room_Id, Customer_SSN, Employee_SSN, Start_Date, End_Date)
                                  VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->bind_param('iissss', $hotelId, $roomId, $customer, $employee, $start, $end);
            $stmt->execute();
            $ok = 'Direct renting created.';
        }
    } catch (Throwable $t) {
        if ($db->errno) {
            $db->rollback();
        }
        $err = $t->getMessage();
    }
}

pageHeader('Renting Actions (Employee)');
flash($ok, $err);
?>
<div class="card">
  <h3>Transform Booking to Renting</h3>
  <form method="post">
    <input type="hidden" name="action" value="from_booking">
    <div class="row">
      <label>Booking ID <input type="number" name="booking_id" required></label>
      <label>Employee SSN/SIN/ID <input type="text" name="employee_ssn" required></label>
    </div>
    <button type="submit">Transform</button>
  </form>
</div>

<div class="card">
  <h3>Direct Renting (Walk-in customer)</h3>
  <form method="post">
    <input type="hidden" name="action" value="direct_rent">
    <div class="row">
      <label>Hotel ID <input type="number" name="hotel_id" required></label>
      <label>Room ID <input type="number" name="room_id" required></label>
      <label>Customer SSN/SIN/ID <input type="text" name="customer_ssn" required></label>
      <label>Employee SSN/SIN/ID <input type="text" name="employee_ssn" required></label>
      <label>Start date <input type="date" name="start_date" required></label>
      <label>End date <input type="date" name="end_date" required></label>
    </div>
    <button type="submit">Create renting</button>
  </form>
</div>
<?php pageFooter(); ?>