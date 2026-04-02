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
            $stmt = $db->prepare("INSERT INTO Employee (Employee_SSN, Hotel_Id, First_Name, Last_Name, Address)
                                  VALUES (?, ?, ?, ?, ?)");
            $stmt->bind_param('sisss', $_POST['ssn'], $_POST['hotel_id'], $_POST['first_name'], $_POST['last_name'], $_POST['address']);
            $stmt->execute();
            $ok = 'Employee inserted.';
        } elseif ($action === 'update') {
            $stmt = $db->prepare("UPDATE Employee SET Hotel_Id = ?, First_Name = ?, Last_Name = ?, Address = ? WHERE Employee_SSN = ?");
            $stmt->bind_param('issss', $_POST['hotel_id'], $_POST['first_name'], $_POST['last_name'], $_POST['address'], $_POST['ssn']);
            $stmt->execute();
            $ok = 'Employee updated.';
        } elseif ($action === 'delete') {
            $stmt = $db->prepare("DELETE FROM Employee WHERE Employee_SSN = ?");
            $stmt->bind_param('s', $_POST['ssn']);
            $stmt->execute();
            $ok = 'Employee deleted.';
        } elseif ($action === 'add_role') {
            $stmt = $db->prepare("INSERT INTO EmployeeRole (Employee_SSN, Role_Type) VALUES (?, ?)");
            $stmt->bind_param('ss', $_POST['ssn'], $_POST['role_type']);
            $stmt->execute();
            $ok = 'Role added.';
        }
    }
} catch (Throwable $t) {
    $err = $t->getMessage();
}

$employees = $db->query("SELECT * FROM Employee ORDER BY Hotel_Id, Last_Name LIMIT 200")->fetch_all(MYSQLI_ASSOC);
pageHeader('Employees CRUD');
flash($ok, $err);
?>
<div class="card">
  <h3>Create / Update</h3>
  <form method="post">
    <div class="row">
      <label>Employee SSN/SIN<input type="text" name="ssn" required></label>
      <label>Hotel ID<input type="number" name="hotel_id" required></label>
      <label>First name<input type="text" name="first_name" required></label>
      <label>Last name<input type="text" name="last_name" required></label>
      <label>Address<input type="text" name="address" required></label>
    </div>
    <button name="action" value="create" type="submit">Insert</button>
    <button name="action" value="update" type="submit">Update</button>
  </form>
</div>
<div class="card">
  <h3>Delete</h3>
  <form method="post">
    <label>Employee SSN/SIN<input type="text" name="ssn" required></label>
    <button name="action" value="delete" type="submit">Delete</button>
  </form>
</div>
<div class="card">
  <h3>Add role/position</h3>
  <form method="post">
    <div class="row">
      <label>Employee SSN/SIN<input type="text" name="ssn" required></label>
      <label>Role<input type="text" name="role_type" required></label>
    </div>
    <button name="action" value="add_role" type="submit">Add role</button>
  </form>
</div>
<div class="card">
  <h3>Employees</h3>
  <table>
    <tr><th>ID</th><th>Hotel</th><th>Name</th><th>Address</th></tr>
    <?php foreach ($employees as $e): ?>
      <tr>
        <td><?= h((string) $e['Employee_SSN']) ?></td>
        <td><?= h((string) $e['Hotel_Id']) ?></td>
        <td><?= h($e['First_Name'] . ' ' . $e['Last_Name']) ?></td>
        <td><?= h((string) $e['Address']) ?></td>
      </tr>
    <?php endforeach; ?>
  </table>
</div>
<?php pageFooter(); ?>
