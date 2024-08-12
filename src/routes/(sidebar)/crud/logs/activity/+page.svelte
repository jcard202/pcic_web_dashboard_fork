<!-- <script>
    const timelineData = [
      {
        date: 'July 5, 2018',
        events: [
          {
            time: '6:52 PM',
            iconColor: '#4CAF50',
            icon: 'wordpress-icon.png',
            title: 'WordPress',
            description: 'WordPress autoupdated to version 4.9.7',
            details: 'Update complete',
          },
          {
            time: '3:29 PM',
            iconColor: '#FFC107',
            icon: 'plugin-icon.png',
            title: 'Filipe Varela',
            description: 'WP Mail SMTP 1.3.3',
            details: 'Plugin updated',
          },
          {
            time: '3:07 PM',
            iconColor: '#FFC107',
            icon: 'plugin-icon.png',
            title: 'WordPress',
            description: 'WP Mail SMTP 1.3.3',
            details: 'Plugin update available',
          },
          {
            time: '1:02 PM',
            iconColor: '#009688',
            icon: 'lock-icon.png',
            title: 'Jetpack',
            description: 'keoshi had a failed login attempt from IP Address:',
            details: 'Login failed',
          },
        ],
      },
      {
        date: 'July 4, 2018',
        events: [
          {
            time: '2:20 PM',
            iconColor: '#4CAF50',
            icon: 'jetpack-icon.png',
            title: 'Jetpack',
            description: 'Jetpack by WordPress.com 6.3.2',
            details: 'Plugin autoupdated',
          },
        ],
      },
    ];
  </script>
  
  <div class="timeline">
    {#each timelineData as { date, events }}
      <div class="timeline-date">{date}</div>
  
      {#each events as event}
        <div class="timeline-item">
          <div class="timeline-icon" style="background-color: {event.iconColor};">
            <img src={event.icon} alt={event.title} />
          </div>
          <div class="timeline-content">
            <h3>{event.title}</h3>
            <p>{event.description}</p>
            <small>{event.details}</small>
          </div>
          <div class="timeline-time">{event.time}</div>
        </div>
      {/each}
    {/each}
  </div>
  
  <style>
    .timeline {
      width: 600px;
      margin: 0 auto;
      position: relative;
      padding: 20px 0;
    }
  
    .timeline-date {
      text-align: center;
      margin-bottom: 20px;
      font-weight: bold;
      color: #333;
    }
  
    .timeline-item {
      display: flex;
      align-items: flex-start;
      position: relative;
      margin-bottom: 20px;
    }
  
    .timeline-item::before {
      content: "";
      position: absolute;
      top: 15px;
      left: 30px;
      width: 2px;
      height: 100%;
      background: #E0E0E0;
    }
  
    .timeline-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 1;
      margin-right: 15px;
    }
  
    .timeline-icon img {
      width: 40px;
      height: 40px;
    }
  
    .timeline-content {
      background: #FFF;
      padding: 15px;
      border-radius: 6px;
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
      flex-grow: 1;
    }
  
    .timeline-content h3 {
      margin: 0 0 5px;
      font-size: 16px;
    }
  
    .timeline-content p {
      margin: 0;
      font-size: 14px;
      color: #555;
    }
  
    .timeline-content small {
      display: block;
      margin-top: 5px;
      font-size: 12px;
      color: #999;
    }
  
    .timeline-time {
      margin-left: auto;
      font-size: 14px;
      color: #999;
      padding-top: 10px;
    }
  </style>
   -->