document.addEventListener('DOMContentLoaded', () => {
    
    // Navbar Scroll Effect
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle (Basic implementation)
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    // In a real app, you'd toggle a 'active' class on navLinks and add CSS for mobile view
    // For now, simple alert if they click it since we hid it in CSS for mobile
    if(hamburger) {
        hamburger.addEventListener('click', () => {
            alert('Mobile menu feature coming soon! View on desktop for full experience.');
            // navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            // navLinks.style.flexDirection = 'column';
        });
    }

    // Scroll Reveal Animations
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const revealPoint = 150;

        revealElements.forEach(el => {
            const revealTop = el.getBoundingClientRect().top;
            if (revealTop < windowHeight - revealPoint) {
                el.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Trigger on load

    // Number Counter Animation
    const counters = document.querySelectorAll('.counter');
    let counted = false;

    const runCounters = () => {
        counters.forEach(counter => {
            counter.innerText = '0';
            const updateCounter = () => {
                const target = +counter.getAttribute('data-target');
                const c = +counter.innerText;
                const increment = target / 50; // speed

                if (c < target) {
                    counter.innerText = `${Math.ceil(c + increment)}`;
                    setTimeout(updateCounter, 30);
                } else {
                    counter.innerText = target;
                }
            };
            updateCounter();
        });
    };

    // Run counter only when hero section comes into view
    // Since it's at top, we run it shortly after load
    setTimeout(runCounters, 500);

    // Smooth Scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if(target) {
                window.scrollTo({
                    top: target.offsetTop - 80, // Offset for sticky header
                    behavior: 'smooth'
                });
            }
        });
    });

    // Form submission simulation
    const form = document.getElementById('contactForm');
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const originalText = btn.innerText;
            
            btn.innerText = 'Sending...';
            btn.disabled = true;
            
            setTimeout(() => {
                btn.innerText = 'Message Sent!';
                btn.style.background = '#10b981'; // Green
                form.reset();
                
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style.background = '';
                    btn.disabled = false;
                }, 3000);
            }, 1500);
        });
    }
});
