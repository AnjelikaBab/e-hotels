<?php
declare(strict_types=1);
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/layout.php';

$db = getDb();
$ok = null;
$err = null;

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $action = $_POST['action'] ?? '';
        if ($action === 'create') {
            $stmt = $db->prepare("INSERT INTO Customer (Customer_SSN, First_Name, Last_Name, Address, Registration_Date)
                                  VALUES (?, ?, ?, ?, ?)");
            $stmt->bind_param('sssss', $_POST['ssn'], $_POST['first_name'], $_POST['last_name'], $_POST['address'], $_POST['registration_date']);
            $stmt->execute();
            $ok = 'Customer inserted.';
        } elseif ($action === 'update') {
            $stmt = $db->prepare("UPDATE Customer SET First_Name = ?, Last_Name = ?, Address = ? WHERE Customer_SSN = ?");
            $stmt->bind_param('ssss', $_POST['first_name'], $_POST['last_name'], $_POST['address'], $_POST['ssn']);
            $stmt->execute();
            $ok = 'Customer updated.';
        } elseif ($action === 'delete') {
            $stmt = $db->prepare("DELETE FROM Customer WHERE Customer_SSN = ?");
            $stmt->bind_param('s', $_POST['ssn']);
            $stmt->execute();
            $ok = 'Customer deleted.';
        }
    }
} catch (Throwable $t) {
    $err = $t->getMessage();
}

$customers = $db->query("SELECT * FROM Customer ORDER BY Registration_Date DESC LIMIT 200")->fetch_all(MYSQLI_ASSOC);
pageHeader('Customers CRUD');
flash($ok, $err);
?>
<div class="card">
  <h3>Create / Update</h3>
  <form method="post">
    <div class="row">
      <label>ID (SSN/SIN/License)<input type="text" name="ssn" required></label>
      <label>First name<input type="text" name="first_name" required></label>
      <label>Last name<input type="text" name="last_name" required></label>
      <label>Address<input type="text" name="address" required></label>
      <label>Registration date<input type="date" name="registration_date" value="<?= date('Y-m-d') ?>"></label>
    </div>
    <button name="action" value="create" type="submit">Insert</button>
    <button name="action" value="update" type="submit">Update</button>
  </form>
</div>
<div class="card">
  <h3>Delete</h3>
  <form method="post">
    <label>ID (SSN/SIN/License)<input type="text" name="ssn" required></label>
    <button name="action" value="delete" type="submit">Delete</button>
  </form>
</div>
<div class="card">
  <h3>Recent customers</h3>
  <table>
    <tr><th>ID</th><th>Name</th><th>Address</th><th>Registration date</th></tr>
    <?php foreach ($customers as $c): ?>
      <tr>
        <td><?= h((string) $c['Customer_SSN']) ?></td>
        <td><?= h($c['First_Name'] . ' ' . $c['Last_Name']) ?></td>
        <td><?= h((string) $c['Address']) ?></td>
        <td><?= h((string) $c['Registration_Date']) ?></td>
      </tr>
    <?php endforeach; ?>
  </table>
</div>
<?php pageFooter(); ?>
