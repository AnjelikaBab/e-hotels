<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/layout.php';

pageHeader('e-Hotels');
?>
<div class="card">
  <p>Use the navigation menu to search, book, rent, process payments, view reporting views, and manage customers/employees/hotels/rooms.</p>
  <p class="small">Set DB credentials via environment variables: <code>DB_HOST</code>, <code>DB_PORT</code>, <code>DB_USER</code>, <code>DB_PASS</code>, <code>DB_NAME</code>.</p>
</div>
<?php pageFooter(); ?>