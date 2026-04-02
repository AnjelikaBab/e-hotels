<?php
declare(strict_types=1);
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/layout.php';

$db = getDb();
$filters = [
    'start' => $_GET['start'] ?? '',
    'end' => $_GET['end'] ?? '',
    'capacity' => $_GET['capacity'] ?? '',
    'area' => $_GET['area'] ?? '',
    'chain' => $_GET['chain'] ?? '',
    'rating' => $_GET['rating'] ?? '',
    'total_rooms' => $_GET['total_rooms'] ?? '',
    'max_price' => $_GET['max_price'] ?? '',
];

$sql = "SELECT r.Hotel_Id, r.Room_Id, r.Price, r.Capacity, h.Area, h.Rating, h.HotelChain_Id,
        hc.Central_Office_Address, hs.Total_Rooms
        FROM Room r
        JOIN Hotel h ON h.Hotel_Id = r.Hotel_Id
        JOIN HotelChain hc ON hc.HotelChain_Id = h.HotelChain_Id
        JOIN (
            SELECT Hotel_Id, COUNT(*) AS Total_Rooms
            FROM Room
            GROUP BY Hotel_Id
        ) hs ON hs.Hotel_Id = h.Hotel_Id
        WHERE 1=1";

$types = '';
$params = [];

if ($filters['capacity'] !== '') {
    $sql .= " AND r.Capacity = ?";
    $types .= 's';
    $params[] = $filters['capacity'];
}
if ($filters['area'] !== '') {
    $sql .= " AND h.Area LIKE ?";
    $types .= 's';
    $params[] = '%' . $filters['area'] . '%';
}
if ($filters['chain'] !== '') {
    $sql .= " AND h.HotelChain_Id = ?";
    $types .= 'i';
    $params[] = (int) $filters['chain'];
}
if ($filters['rating'] !== '') {
    $sql .= " AND h.Rating = ?";
    $types .= 'i';
    $params[] = (int) $filters['rating'];
}
if ($filters['total_rooms'] !== '') {
    $sql .= " AND hs.Total_Rooms >= ?";
    $types .= 'i';
    $params[] = (int) $filters['total_rooms'];
}
if ($filters['max_price'] !== '') {
    $sql .= " AND r.Price <= ?";
    $types .= 'd';
    $params[] = (float) $filters['max_price'];
}
if ($filters['start'] !== '' && $filters['end'] !== '') {
    $sql .= " AND NOT EXISTS (
        SELECT 1 FROM Booking b
        WHERE b.Hotel_Id = r.Hotel_Id
          AND b.Room_Id = r.Room_Id
          AND b.Booking_Status = 'active'
          AND b.Start_Date < ?
          AND b.End_Date > ?
    ) AND NOT EXISTS (
        SELECT 1 FROM Renting rt
        WHERE rt.Hotel_Id = r.Hotel_Id
          AND rt.Room_Id = r.Room_Id
          AND rt.Start_Date < ?
          AND rt.End_Date > ?
    )";
    $types .= 'ssss';
    $params[] = $filters['end'];
    $params[] = $filters['start'];
    $params[] = $filters['end'];
    $params[] = $filters['start'];
}

$stmt = $db->prepare($sql . " ORDER BY r.Price ASC LIMIT 200");
if ($types !== '') {
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$rooms = fetchAll($stmt);

pageHeader('Search Available Rooms');
?>
<div class="card">
  <form method="get">
    <div class="row">
      <label>Start date <input type="date" name="start" value="<?= h($filters['start']) ?>"></label>
      <label>End date <input type="date" name="end" value="<?= h($filters['end']) ?>"></label>
      <label>Capacity
        <select name="capacity">
          <option value="">Any</option>
          <?php foreach (['single', 'double', 'triple', 'quad', 'suite'] as $cap): ?>
            <option value="<?= $cap ?>" <?= $filters['capacity'] === $cap ? 'selected' : '' ?>><?= ucfirst($cap) ?></option>
          <?php endforeach; ?>
        </select>
      </label>
      <label>Area <input type="text" name="area" value="<?= h($filters['area']) ?>"></label>
      <label>Hotel chain ID <input type="number" min="1" name="chain" value="<?= h($filters['chain']) ?>"></label>
      <label>Hotel category (1-5) <input type="number" min="1" max="5" name="rating" value="<?= h($filters['rating']) ?>"></label>
      <label>Min rooms in hotel <input type="number" min="1" name="total_rooms" value="<?= h($filters['total_rooms']) ?>"></label>
      <label>Max room price <input type="number" min="1" step="0.01" name="max_price" value="<?= h($filters['max_price']) ?>"></label>
    </div>
    <button type="submit">Apply filters</button>
  </form>
</div>

<div class="card">
  <strong><?= count($rooms) ?></strong> room(s) found.
  <table>
    <tr><th>Hotel</th><th>Room</th><th>Price</th><th>Capacity</th><th>Area</th><th>Category</th><th>Chain</th><th>Total rooms</th></tr>
    <?php foreach ($rooms as $r): ?>
      <tr>
        <td><?= h((string) $r['Hotel_Id']) ?></td>
        <td><?= h((string) $r['Room_Id']) ?></td>
        <td><?= h((string) $r['Price']) ?></td>
        <td><?= h((string) $r['Capacity']) ?></td>
        <td><?= h((string) $r['Area']) ?></td>
        <td><?= h((string) $r['Rating']) ?></td>
        <td><?= h((string) $r['HotelChain_Id']) ?></td>
        <td><?= h((string) $r['Total_Rooms']) ?></td>
      </tr>
    <?php endforeach; ?>
  </table>
</div>
<?php pageFooter(); ?>