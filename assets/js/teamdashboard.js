let currentUserId = null;

document.addEventListener('DOMContentLoaded', function() {
    // Prevent multiple initializations
    if (window.dashboardLoaded) return;
    window.dashboardLoaded = true;
    
    requireRole('user', async function(user, userData) {
        currentUserId = user.uid;

        document.getElementById('welcomeMessage').textContent = `Hi, ${userData.name}`;
        console.log('User data loaded:', userData);

        if (user.photoURL) {
            const userPhoto = document.getElementById('profileSection');
            userPhoto.src = user.photoURL;
            userPhoto.style.display = 'block';
        }

        // Initially load dashboard
        loadUserRegisteredCompetitions();

        loadUserStats(userData);
        await loadRegisteredCompetitions(userData.registeredEvents || []);
        await loadAvailableCompetitions();
        loadMembers();
        setupModal();
        setupNavigation();
    });
});

// Navigation setup, for tabs (if any)
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            contentSections.forEach(section => section.style.display = 'none');
            const sectionId = link.getAttribute('data-section') + '-section';
            const targetSection = document.getElementById(sectionId);
            if (targetSection) targetSection.style.display = 'block';
            if (link.getAttribute('data-section') === 'members') loadMembers();
        });
    });
}
async function loadUserRegisteredCompetitions() {
  const userDoc = await db.collection('users').doc(currentUserId).get();
  if (!userDoc.exists) {
    console.error('User document not found');
    return;
  }

  const eventIds = userDoc.data().registeredEvents || [];
  const container = document.getElementById('registeredEvents');
  container.innerHTML = '';

  if (eventIds.length === 0) {
    container.innerHTML = '<p>You have no registered competitions yet.</p>';
    return;
  }

  for (const eventId of eventIds) {
    const eventDoc = await db.collection('competitions').doc(eventId).get();
    if (eventDoc.exists) {
      const event = eventDoc.data();
      const div = document.createElement('div');
      div.className = 'competition-card';
      div.innerHTML = `
        <h3>${event.title}</h3>
        <p>${event.description}</p>
        <p><strong>Date:</strong> ${formatDate(event.date)}</p>
      `;
      container.appendChild(div);
    }
  }
}

// User stats: wins and registered event count
function loadUserStats(userData) {
    document.getElementById('totalWins').textContent = userData.wins || 0;
    document.getElementById('registeredCount').textContent =
        userData.registeredEvents ? userData.registeredEvents.length : 0;
        console.log('User stats loaded:', {
            wins: userData.wins || 0,
            registeredCount: userData.registeredEvents ? userData.registeredEvents.length : 0})
    document.getElementById('winPercentage').textContent = userData.winPercentage ? `${userData.winPercentage}%` : '0%';
}

// Show competitions the user is registered for
async function loadRegisteredCompetitions(eventIds) {
    const registeredEventsContainer = document.getElementById('previousTasks');
    registeredEventsContainer.innerHTML = '';

    if (!eventIds || eventIds.length === 0) {
        registeredEventsContainer.innerHTML = `
            <p class="no-data">You haven't participated in any competition yet.</p>
        `;
        return;
    }
    try {
        for (const eventId of eventIds) {
            const eventDoc = await db.collection('competitions').doc(eventId).get();
            if (eventDoc.exists) {
                const comp = eventDoc.data();
                const eventDiv = document.createElement('div');
                eventDiv.className = 'registered-event-card';
                eventDiv.innerHTML = `
                <div class="eventcard">
                    <h3> ${comp.title}</h3>
                    <p class="competition-description">Event :</p>
                    <p class="competition-date">Date : ${formatDate(comp.date)}</p>
                    
                    <div class="event-actions">
                    </div>
                    </div>
                `;
                registeredEventsContainer.appendChild(eventDiv);
            }
        }
    } catch (error) {
        registeredEventsContainer.innerHTML = '<p class="error-text">Error loading registered events</p>';
        console.error('Error loading registered events:', error);
    }
}

// Show all available competitions, not just registered ones
async function loadAvailableCompetitions() {
  try {
    const competitions = await db.collection('competitions')
      .orderBy('date', 'asc')
      .get();

    console.log('Available competitions count:', competitions.size);

    const container = document.getElementById('currentTasks');
    container.innerHTML = '';

    if (competitions.empty) {
      container.innerHTML = '<p class="no-data">No upcoming competitions</p>';
      return;
    }

    competitions.forEach(doc => {
      const comp = doc.data();
      console.log('Competition:', comp.title, comp.date);
      const div = document.createElement('div');
      div.className = 'competition-card';
      div.innerHTML = `
          <h3>${comp.title}</h3>
          <p>Date: ${comp.date}</p>
          <p>${comp.description}</p>`;
      container.appendChild(div);
    });
  } catch (error) {
    console.error('Failed to load competitions:', error);
  }
}


// Show all members
async function loadMembers() {
    try {
        const users = await db.collection('users').get();
        const membersGrid = document.getElementById('membersGrid');
        membersGrid.innerHTML = '';
        if (users.empty) {
            membersGrid.innerHTML = '<p class="no-data">No members found</p>';
            return;
        }
        users.forEach(doc => {
            const user = doc.data();
            const card = document.createElement('div');
            card.className = 'member-card';
            card.innerHTML = `
                <img src="${user.photoURL || 'https://via.placeholder.com/60x60?text=' + (user.name ? user.name.charAt(0) : 'U')}" 
                     alt="${user.name}" class="member-avatar">
                <div class="member-info">
                    <h4>${user.name}</h4>
                    <p>${user.email}</p>
                    <p><strong>Role:</strong> ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
                    <p><strong>Joined:</strong> ${user.createdAt ? formatDate(user.createdAt.toDate?.() || user.createdAt) : 'N/A'}</p>
                </div>
                <div class="member-stats">
                    <div class="stat-item">
                        <span class="stat-number">${user.wins || 0}</span>
                        <span class="stat-label">Wins</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${user.registeredEvents ? user.registeredEvents.length : 0}</span>
                        <span class="stat-label">Events</span>
                    </div>
                </div>
            `;
            membersGrid.appendChild(card);
        });
    } catch (error) {
        const membersGrid = document.getElementById('membersGrid');
        membersGrid.innerHTML = '<p class="error-text">Error loading members</p>';
        console.error('Error loading members:', error);
    }
}

// Show competition details (and registered users' NAMES for this event only!)
async function showCompetitionDetails(competitionId) {
    try {
        const compDoc = await db.collection('competitions').doc(competitionId).get();
        if (!compDoc.exists) return;
        const comp = compDoc.data();

        let registeredUsersList = '';
        if (comp.registeredUsers && comp.registeredUsers.length > 0) {
            registeredUsersList = '<ul>';
            // Fetch user names for each registered user
            for (const userId of comp.registeredUsers) {
                const userDoc = await db.collection('users').doc(userId).get();
                if (userDoc.exists) {
                    const user = userDoc.data();
                    registeredUsersList += `<li>${user.name} (${user.studentClass || ''})</li>`;
                }
            }
            registeredUsersList += '</ul>';
        } else {
            registeredUsersList = '<p>No registrations yet.</p>';
        }

        const detailsContainer = document.getElementById('competitionDetails');
        detailsContainer.innerHTML = `
            <h2>${comp.title}</h2>
            <p><strong>Date:</strong> ${formatDate(comp.date)}</p>
            <p><strong>Description:</strong> ${comp.description}</p>
            <div class="contact-info" style="margin: 20px 0;">
                <strong>To Register for this Competition:</strong><br>
                <strong>Contact: +91 9971064494</strong>
                <p>All registrations must be done through this contact number</p>
            </div>
            <div>
                <h3>Registered Users</h3>
                ${registeredUsersList}
            </div>
            <div class="competition-actions">
                ${comp.website ? `<a href="${comp.website}" target="_blank" class="btn-link">Visit Website</a>` : ''}
                ${comp.brochure ? `<a href="${comp.brochure}" target="_blank" class="btn-link">Download Brochure</a>` : ''}
            </div>
        `;
        document.getElementById('competitionModal').style.display = 'block';
    } catch (error) {
        showNotification('Error loading competition details', 'error');
        console.error('Error loading competition details:', error);
    }
}

// Modal close logic
function setupModal() {
    const modal = document.getElementById('competitionModal');
    const closeBtn = document.getElementsByClassName('close')[0];
    if (closeBtn) closeBtn.onclick = function() { modal.style.display = 'none'; }
    window.onclick = function(event) {
        if (event.target == modal) modal.style.display = 'none';
    };
}

// Utility
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => { notification.remove(); }, 3000);
}
