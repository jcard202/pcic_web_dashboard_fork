
<script lang='ts'>
    export let data;

    const {users} = data 
</script>

<section aria-label="Inspector Information">
    <h2>Inspector Information</h2>
    <div class="table-responsive">
      <table class="inspector-table">
        <caption>List of inspectors and their performance metrics</caption>
        <thead>
          <tr>
            <th scope="col">Inspector Name</th>
            <th scope="col">Mobile Number</th>
            <th scope="col">Online</th>
            <th scope="col">Total Dispatch</th>
            <th scope="col">Total Ongoing</th>
            <th scope="col">Total Completed</th>
          </tr>
        </thead>
        <tbody>
          {#each users as user}
            <tr>
              <th scope="row">{user.inspector_name}</th>
              <td>{user.mobile_number || 'N/A'}</td>
              <td>
                <span class="status-indicator {user.is_online ? 'online' : 'offline'}">
                  {user.is_online ? 'Online' : 'Offline'}
                </span>
              </td>
              <td>{user.total_dispatch}</td>
              <td>{user.total_ongoing}</td>
              <td>{user.total_completed}</td>
            </tr>
          {:else}
            <tr>
              <td colspan="6">No users found</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>
  
  <form method="POST">
    <button class="logout-button" type="submit">Logout</button>
  </form>