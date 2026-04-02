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
            $stmt = $db->prepare("INSERT INTO Hotel (HotelChain_Id, Rating, Address, Area, Email, Phone_Number)
                                  VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->bind_param('iissss', $_POST['chain_id'], $_POST['rating'], $_POST['address'], $_POST['area'], $_POST['email'], $_POST['phone']);
            $stmt->execute();
            $ok = 'Hotel inserted.';
        } elseif ($action === 'update') {
            $stmt = $db->prepare("UPDATE Hotel SET HotelChain_Id = ?, Rating = ?, Address = ?, Area = ?, Email = ?, Phone_Number = ?
                                  WHERE Hotel_Id = ?");
            $stmt->bind_param('iissssi', $_POST['chain_id'], $_POST['rating'], $_POST['address'], $_POST['area'], $_POST['email'], $_POST['phone'], $_POST['hotel_id']);
            $stmt->execute();
            $ok = 'Hotel updated.';
        } elseif ($action === 'delete') {
            $stmt = $db->prepare("DELETE FROM Hotel WHERE Hotel_Id = ?");
            $stmt->bind_param('i', $_POST['hotel_id']);
            $stmt->execute();
            $ok = 'Hotel deleted.';
        }
    }
} catch (Throwable $t) {
    $err = $t->getMessage();
}

$hotels = $db->query("SELECT h.*, (SELECT COUNT(*) FROM Room r WHERE r.Hotel_Id = h.Hotel_Id) AS RoomCount
                      FROM Hotel h ORDER BY h.Hotel_Id DESC LIMIT 200")->fetch_all(MYSQLI_ASSOC);
pageHeader('Hotels CRUD');
flash($ok, $err);
?>
<div class="card">
  <h3>Create / Update</h3>
  <form method="post">
    <div class="row">
      <label>Hotel ID (for update/delete)<input type="number" name="hotel_id"></label>
      <label>Hotel Chain ID<input type="number" name="chain_id" required></label>
      <label>Category (1-5)<input type="number" min="1" max="5" name="rating" required></label>
      <label>Address<input type="text" name="address" required></label>
      <label>Area<input type="text" name="area" required></label>
      <label>Email<input type="email" name="email"></label>
      <label>Phone<input type="text" name="phone"></label>
    </div>
    <button name="action" value="create" type="submit">Insert</button>
    <button name="action" value="update" type="submit">Update</button>
  </form>
</div>
<div class="card">
  <h3>Delete</h3>
  <form method="post">
    <label>Hotel ID<input type="number" name="hotel_id" required></label>
    <button name="action" value="delete" type="submit">Delete</button>
  </form>
</div>
<div class="card">
  <h3>Hotels</h3>
  <table>
    <tr><th>ID</th><th>Chain</th><th>Category</th><th>Area</th><th>Address</th><th>Rooms</th></tr>
    <?php foreach ($hotels as $hRow): ?>
      <tr>
        <td><?= h((string) $hRow['Hotel_Id']) ?></td>
        <td><?= h((string) $hRow['HotelChain_Id']) ?></td>
        <td><?= h((string) $hRow['Rating']) ?></td>
        <td><?= h((string) $hRow['Area']) ?></td>
        <td><?= h((string) $hRow['Address']) ?></td>
        <td><?= h((string) $hRow['RoomCount']) ?></td>
      </tr>
    <?php endforeach; ?>
  </table>
</div>
<?php pageFooter(); ?>
