<?php
declare(strict_types=1);
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/layout.php';

$db = getDb();
$ok = null;
$err = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $rentingId = (int) ($_POST['renting_id'] ?? 0);
        $amount = (float) ($_POST['amount'] ?? 0);
        $status = $_POST['status'] ?? 'paid';
        $stmt = $db->prepare("UPDATE Renting SET Payment_Amount = ?, Payment_Status = ? WHERE Renting_Id = ?");
        $stmt->bind_param('dsi', $amount, $status, $rentingId);
        $stmt->execute();
        $ok = 'Payment updated.';
    } catch (Throwable $t) {
        $err = $t->getMessage();
    }
}

pageHeader('Insert Customer Payment');
flash($ok, $err);
?>
<div class="card">
  <form method="post">
    <div class="row">
      <label>Renting ID <input type="number" name="renting_id" required></label>
      <label>Amount <input type="number" min="0" step="0.01" name="amount" required></label>
      <label>Status
        <select name="status">
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="refunded">Refunded</option>
        </select>
      </label>
    </div>
    <button type="submit">Save payment</button>
  </form>
</div>
<?php pageFooter(); ?>