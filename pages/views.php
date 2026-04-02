<?php
declare(strict_types=1);
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/layout.php';

$db = getDb();
$v1 = $db->query("SELECT * FROM AvailableRoomsPerArea ORDER BY Area")->fetch_all(MYSQLI_ASSOC);
$v2 = $db->query("SELECT * FROM HotelCapacity ORDER BY Hotel_Id")->fetch_all(MYSQLI_ASSOC);

pageHeader('SQL Views');
?>
<div class="card">
  <h3>AvailableRoomsPerArea</h3>
  <table>
    <tr><th>Area</th><th>Available rooms</th></tr>
    <?php foreach ($v1 as $r): ?>
      <tr><td><?= h((string) $r['Area']) ?></td><td><?= h((string) $r['Available_Rooms']) ?></td></tr>
    <?php endforeach; ?>
  </table>
</div>

<div class="card">
  <h3>HotelCapacity</h3>
  <table>
    <tr><th>Hotel ID</th><th>Address</th><th>Total capacity</th></tr>
    <?php foreach ($v2 as $r): ?>
      <tr>
        <td><?= h((string) $r['Hotel_Id']) ?></td>
        <td><?= h((string) $r['Address']) ?></td>
        <td><?= h((string) $r['Total_Capacity']) ?></td>
      </tr>
    <?php endforeach; ?>
  </table>
</div>
<?php pageFooter(); ?>