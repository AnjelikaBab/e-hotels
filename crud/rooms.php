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
            $stmt = $db->prepare("INSERT INTO Room (Hotel_Id, Room_Id, Price, Capacity, View_Type, Extendable)
                                  VALUES (?, ?, ?, ?, ?, ?)");
            $extendable = isset($_POST['extendable']) ? 1 : 0;
            $stmt->bind_param('iidssi', $_POST['hotel_id'], $_POST['room_id'], $_POST['price'], $_POST['capacity'], $_POST['view_type'], $extendable);
            $stmt->execute();
            $ok = 'Room inserted.';
        } elseif ($action === 'update') {
            $stmt = $db->prepare("UPDATE Room SET Price = ?, Capacity = ?, View_Type = ?, Extendable = ?
                                  WHERE Hotel_Id = ? AND Room_Id = ?");
            $extendable = isset($_POST['extendable']) ? 1 : 0;
            $stmt->bind_param('dssiii', $_POST['price'], $_POST['capacity'], $_POST['view_type'], $extendable, $_POST['hotel_id'], $_POST['room_id']);
            $stmt->execute();
            $ok = 'Room updated.';
        } elseif ($action === 'delete') {
            $stmt = $db->prepare("DELETE FROM Room WHERE Hotel_Id = ? AND Room_Id = ?");
            $stmt->bind_param('ii', $_POST['hotel_id'], $_POST['room_id']);
            $stmt->execute();
            $ok = 'Room deleted.';
        } elseif ($action === 'issue') {
            $stmt = $db->prepare("INSERT INTO RoomIssues (Hotel_Id, Room_Id, Issue) VALUES (?, ?, ?)");
            $stmt->bind_param('iis', $_POST['hotel_id'], $_POST['room_id'], $_POST['issue']);
            $stmt->execute();
            $ok = 'Issue added.';
        } elseif ($action === 'amenity') {
            $stmt = $db->prepare("INSERT INTO RoomAmenities (Hotel_Id, Room_Id, Amenity) VALUES (?, ?, ?)");
            $stmt->bind_param('iis', $_POST['hotel_id'], $_POST['room_id'], $_POST['amenity']);
            $stmt->execute();
            $ok = 'Amenity added.';
        }
    }
} catch (Throwable $t) {
    $err = $t->getMessage();
}

$rooms = $db->query("SELECT * FROM Room ORDER BY Hotel_Id, Room_Id LIMIT 300")->fetch_all(MYSQLI_ASSOC);
pageHeader('Rooms CRUD');
flash($ok, $err);
?>
<div class="card">
  <h3>Create / Update / Delete</h3>
  <form method="post">
    <div class="row">
      <label>Hotel ID<input type="number" name="hotel_id" required></label>
      <label>Room ID<input type="number" name="room_id" required></label>
      <label>Price<input type="number" min="1" step="0.01" name="price" required></label>
      <label>Capacity
        <select name="capacity">
          <option value="single">Single</option><option value="double">Double</option>
          <option value="triple">Triple</option><option value="quad">Quad</option><option value="suite">Suite</option>
        </select>
      </label>
      <label>View
        <select name="view_type">
          <option value="sea">Sea</option><option value="mountain">Mountain</option>
          <option value="city">City</option><option value="garden">Garden</option><option value="none">None</option>
        </select>
      </label>
      <label><input type="checkbox" name="extendable"> Extendable</label>
    </div>
    <button name="action" value="create" type="submit">Insert</button>
    <button name="action" value="update" type="submit">Update</button>
    <button name="action" value="delete" type="submit">Delete</button>
  </form>
</div>
<div class="card">
  <h3>Add Amenity / Issue</h3>
  <form method="post">
    <div class="row">
      <label>Hotel ID<input type="number" name="hotel_id" required></label>
      <label>Room ID<input type="number" name="room_id" required></label>
      <label>Amenity<input type="text" name="amenity"></label>
      <label>Issue<input type="text" name="issue"></label>
    </div>
    <button name="action" value="amenity" type="submit">Add amenity</button>
    <button name="action" value="issue" type="submit">Add issue</button>
  </form>
</div>
<div class="card">
  <h3>Rooms</h3>
  <table>
    <tr><th>Hotel</th><th>Room</th><th>Price</th><th>Capacity</th><th>View</th><th>Extendable</th></tr>
    <?php foreach ($rooms as $r): ?>
      <tr>
        <td><?= h((string) $r['Hotel_Id']) ?></td>
        <td><?= h((string) $r['Room_Id']) ?></td>
        <td><?= h((string) $r['Price']) ?></td>
        <td><?= h((string) $r['Capacity']) ?></td>
        <td><?= h((string) $r['View_Type']) ?></td>
        <td><?= h((string) $r['Extendable']) ?></td>
      </tr>
    <?php endforeach; ?>
  </table>
</div>
<?php pageFooter(); ?>
