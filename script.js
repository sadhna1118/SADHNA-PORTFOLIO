// ======= CUSTOM CURSOR =======
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    if (cursorDot && cursorOutline) {
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: "forwards" });
    }
});

// Add hover effect to interactive elements
const interactives = document.querySelectorAll('a, button, .project-card, .stat-card, .skill-category');
interactives.forEach(el => {
    el.addEventListener('mouseenter', () => {
        if(cursorOutline) cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.5)';
        if(cursorOutline) cursorOutline.style.backgroundColor = 'rgba(0, 242, 254, 0.1)';
    });
    el.addEventListener('mouseleave', () => {
        if(cursorOutline) cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
        if(cursorOutline) cursorOutline.style.backgroundColor = 'transparent';
    });
});

// ======= THEME TOGGLE =======
const themeToggle = document.getElementById('theme-toggle');
const htmlEl = document.documentElement;

// Check for saved theme in localStorage
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    htmlEl.setAttribute('data-theme', savedTheme);
}

themeToggle.addEventListener('click', () => {
    const currentTheme = htmlEl.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    htmlEl.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// ======= NAVBAR SCROLL =======
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ======= SCROLL ANIMATIONS (INTERSECTION OBSERVER) =======
const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // Stop observing once animated
            observer.unobserve(entry.target);
        }
    });
};

const revealOptions = {
    threshold: 0.1, // trigger when 10% visible
    rootMargin: "0px 0px -50px 0px"
};

const revealObserver = new IntersectionObserver(revealCallback, revealOptions);

revealElements.forEach(el => revealObserver.observe(el));

// ======= SMOOTH SCROLL FOR NAV LINKS =======
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if(targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if(targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Helper to bind cursor hover effect to elements
function bindCursorHover(element) {
    if (!cursorOutline) return;
    const items = element.matches && element.matches('a, button, .project-card, .stat-card, .skill-category')
        ? [element, ...element.querySelectorAll('a, button')]
        : element.querySelectorAll('a, button, .project-card, .stat-card, .skill-category');
    items.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.5)';
            cursorOutline.style.backgroundColor = 'rgba(0, 242, 254, 0.1)';
        });
        el.addEventListener('mouseleave', () => {
            cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
            cursorOutline.style.backgroundColor = 'transparent';
        });
    });
}

// ======= FETCH GITHUB PROJECTS DYNAMICALLY =======
async function fetchGitHubProjects() {
    const grid = document.getElementById('github-projects-grid');
    if (!grid) return;
    
    grid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: var(--text-secondary);">Loading projects from GitHub...</p>';
    
    try {
        const response = await fetch('https://api.github.com/users/sadhna1118/repos?per_page=100');
        if (!response.ok) throw new Error('Failed to fetch');
        const repos = await response.json();
        
        // Sort repositories by updated date (newest first)
        repos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        
        grid.innerHTML = ''; // clear loading text

        const INITIAL_VISIBLE_COUNT = 3;
        const btnContainer = document.getElementById('github-view-all-container');
        const toggleBtn = document.getElementById('toggle-github-projects-btn');
        const toggleBtnText = document.getElementById('toggle-btn-text');
        const toggleBtnIcon = document.getElementById('toggle-btn-icon');
        
        repos.forEach((repo, index) => {
            const isHidden = index >= INITIAL_VISIBLE_COUNT;
            
            // Format name (replace hyphens/underscores with spaces)
            let repoName = repo.name.replace(/[-_]/g, ' ');
            
            // Check if there is a homepage link (Live link)
            const liveLink = repo.homepage 
                ? `<a href="${repo.homepage}" target="_blank" style="display:inline-block; margin-top:1rem; color:var(--accent-1); font-weight:600;"><i class="fa-solid fa-external-link-alt"></i> Live Demo</a>`
                : '';

            const card = document.createElement('div');
            // Reusing the same card classes, adding hidden classes for items > 3
            card.className = `project-card reveal-up ${isHidden ? 'github-extra-card github-project-hidden' : ''}`;
            
            // Add id to description paragraph to update it later
            card.innerHTML = `
                <div class="project-content">
                    <div class="project-header">
                        <h3 style="font-size: 1.2rem; text-transform: capitalize;">${repoName}</h3>
                        <div class="project-links">
                            <a href="${repo.html_url}" target="_blank" title="View Source"><i class="fa-brands fa-github"></i></a>
                        </div>
                    </div>
                    <p class="project-desc" id="desc-${repo.name}" style="font-size: 0.9rem;">${repo.description || 'Fetching details...'}</p>
                    ${liveLink}
                    <div class="project-tags" style="margin-top: 1.5rem;">
                        ${repo.language ? `<span>${repo.language}</span>` : ''}
                        ${repo.topics ? repo.topics.map(t => `<span>${t}</span>`).join('') : ''}
                    </div>
                </div>
            `;
            
            grid.appendChild(card);
            bindCursorHover(card);
            
            // For the initial 3 visible projects, fetch description and trigger animation immediately
            if (!isHidden) {
                fetchReadmeDescription(repo.name, repo.default_branch).then(readmeDesc => {
                    const descEl = document.getElementById(`desc-${repo.name}`);
                    if (descEl) {
                        if (readmeDesc) {
                            descEl.innerText = readmeDesc;
                        } else if (!repo.description) {
                            descEl.innerText = 'A project developed by Sadhna.';
                        }
                    }
                });
                
                // Observe the initial card for scroll animation
                if (typeof revealObserver !== 'undefined') {
                    revealObserver.observe(card);
                } else {
                    card.classList.add('active'); // fallback
                }
            }
        });
        
        // Setup View All / Show Less button
        if (btnContainer && toggleBtn && repos.length > INITIAL_VISIBLE_COUNT) {
            btnContainer.style.display = 'flex';
            toggleBtnText.textContent = `View All Projects (${repos.length})`;
            bindCursorHover(toggleBtn);
            
            let isExpanded = false;
            let extraReadmesLoaded = false;
            
            toggleBtn.addEventListener('click', () => {
                isExpanded = !isExpanded;
                const extraCards = grid.querySelectorAll('.github-extra-card');
                
                if (isExpanded) {
                    extraCards.forEach((card, i) => {
                        card.classList.remove('github-project-hidden');
                        card.classList.add('fade-in-card', 'active');
                        card.style.animationDelay = `${(i % 6) * 0.05}s`;
                    });
                    toggleBtnText.textContent = 'Show Less';
                    if (toggleBtnIcon) toggleBtnIcon.style.transform = 'rotate(180deg)';
                    toggleBtn.setAttribute('aria-expanded', 'true');
                    
                    // Lazily load README descriptions for extra projects once expanded
                    if (!extraReadmesLoaded) {
                        extraReadmesLoaded = true;
                        repos.slice(INITIAL_VISIBLE_COUNT).forEach(repo => {
                            fetchReadmeDescription(repo.name, repo.default_branch).then(readmeDesc => {
                                const descEl = document.getElementById(`desc-${repo.name}`);
                                if (descEl) {
                                    if (readmeDesc) {
                                        descEl.innerText = readmeDesc;
                                    } else if (!repo.description) {
                                        descEl.innerText = 'A project developed by Sadhna.';
                                    }
                                }
                            });
                        });
                    }
                } else {
                    extraCards.forEach(card => {
                        card.classList.add('github-project-hidden');
                        card.classList.remove('fade-in-card');
                        card.style.animationDelay = '0s';
                    });
                    toggleBtnText.textContent = `View All Projects (${repos.length})`;
                    if (toggleBtnIcon) toggleBtnIcon.style.transform = 'rotate(0deg)';
                    toggleBtn.setAttribute('aria-expanded', 'false');
                    
                    // Smoothly scroll back to the top of github projects section
                    const offsetTop = grid.getBoundingClientRect().top + window.pageYOffset - 100;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        }
        
    } catch (error) {
        console.error('Error fetching GitHub repos:', error);
        grid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: red;">Failed to load projects. Please check my GitHub profile directly.</p>';
    }
}

// Function to fetch and extract the first meaningful line from a repo's README
async function fetchReadmeDescription(repoName, branch) {
    try {
        const response = await fetch(`https://raw.githubusercontent.com/sadhna1118/${repoName}/${branch || 'main'}/README.md`);
        if (!response.ok) return null;
        
        const text = await response.text();
        const lines = text.split('\n');
        
        for (let line of lines) {
            line = line.trim();
            // Ignore headers, html tags, badges, and very short lines
            if (line.length > 30 && !line.startsWith('#') && !line.startsWith('<') && !line.startsWith('[')) {
                // Return truncated text
                return line.length > 120 ? line.substring(0, 117) + '...' : line;
            }
        }
    } catch (e) {
        return null;
    }
    return null;
}

// Call the fetch function when DOM is ready
document.addEventListener('DOMContentLoaded', fetchGitHubProjects);
