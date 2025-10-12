 document.addEventListener('DOMContentLoaded', () => {

            // ------------------- //
            // -- CUSTOM CURSOR -- //
            // ------------------- //
            const cursor = document.querySelector('.cursor');
            const cursorDot = document.querySelector('.cursor-dot');
            const hoverElements = document.querySelectorAll('.cursor-hover, button, a, .project-card');

            window.addEventListener('mousemove', e => {
                cursor.style.left = e.clientX + 'px';
                cursor.style.top = e.clientY + 'px';
                cursorDot.style.left = e.clientX + 'px';
                cursorDot.style.top = e.clientY + 'px';
            });
            
            hoverElements.forEach(el => {
                el.addEventListener('mouseenter', () => cursor.classList.add('grow'));
                el.addEventListener('mouseleave', () => cursor.classList.remove('grow'));
            });

            // ------------------- //
            // -- HEADER SCROLL -- //
            // ------------------- //
            const header = document.getElementById('main-header');
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            });

            // ------------------- //
            // -- HERO CANVAS ANIMATION (More subtle) -- //
            // ------------------- //
            const canvas = document.getElementById('hero-canvas');
            const ctx = canvas.getContext('2d');
            let particles = [];
            let mouse = { x: null, y: null, radius: 150 }; // Increased mouse interaction radius
            let animationFrameId;

            function setCanvasSize() {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
            setCanvasSize();

            class Particle {
                constructor(x, y) {
                    this.x = x || Math.random() * canvas.width;
                    this.y = y || Math.random() * canvas.height;
                    this.size = Math.random() * 1.5 + 0.5; // Smaller particles
                    this.baseSpeedX = Math.random() * 0.5 - 0.25; // Slower base movement
                    this.baseSpeedY = Math.random() * 0.5 - 0.25;
                    this.speedX = this.baseSpeedX;
                    this.speedY = this.baseSpeedY;
                    this.color = `rgba(0, 168, 107, ${Math.random() * 0.5 + 0.2})`; // More transparent emerald
                }
                update() {
                    // Mouse repulsion/attraction
                    if (mouse.x && mouse.y) {
                        const dx = mouse.x - this.x;
                        const dy = mouse.y - this.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < mouse.radius) {
                            const forceDirectionX = dx / distance;
                            const forceDirectionY = dy / distance;
                            const maxForce = 5;
                            const force = (mouse.radius - distance) / mouse.radius * maxForce;
                            
                            this.speedX = this.baseSpeedX - forceDirectionX * force * 0.1; // Repel with less strength
                            this.speedY = this.baseSpeedY - forceDirectionY * force * 0.1;
                        } else {
                            this.speedX = this.baseSpeedX;
                            this.speedY = this.baseSpeedY;
                        }
                    }

                    this.x += this.speedX;
                    this.y += this.speedY;

                    // Wrap particles around if they go off screen
                    if (this.x < 0) this.x = canvas.width;
                    if (this.x > canvas.width) this.x = 0;
                    if (this.y < 0) this.y = canvas.height;
                    if (this.y > canvas.height) this.y = 0;
                }
                draw() {
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            function initParticles() {
                particles = [];
                const numberOfParticles = Math.floor((canvas.width * canvas.height) / 8000); // Scale particles with screen size
                for (let i = 0; i < numberOfParticles; i++) {
                    particles.push(new Particle());
                }
            }
            initParticles();

            function handleParticles() {
                for (let i = 0; i < particles.length; i++) {
                    particles[i].update();
                    particles[i].draw();
                    
                    // Connect close particles with lines (more subtle)
                    for (let j = i; j < particles.length; j++) {
                        const dx = particles[i].x - particles[j].x;
                        const dy = particles[i].y - particles[j].y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance < 80) { // Shorter connection distance
                            ctx.beginPath();
                            ctx.strokeStyle = `rgba(255, 191, 0, ${1 - distance/80})`; // Amber with transparency
                            ctx.lineWidth = 0.3; // Thinner lines
                            ctx.moveTo(particles[i].x, particles[i].y);
                            ctx.lineTo(particles[j].x, particles[j].y);
                            ctx.stroke();
                        }
                    }
                }
            }

            function animate() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                handleParticles();
                animationFrameId = requestAnimationFrame(animate);
            }
            animate();
            
            window.addEventListener('resize', () => {
                setCanvasSize();
                initParticles();
            });

            canvas.addEventListener('mousemove', (e) => {
                mouse.x = e.x;
                mouse.y = e.y;
            });
            canvas.addEventListener('mouseleave', () => { // Reset mouse position when leaving canvas
                mouse.x = null;
                mouse.y = null;
            });

            // ------------------- //
            // -- SCROLL ANIMATIONS (Intersection Observer) -- //
            // ------------------- //
            const observerOptions = {
                root: null,
                rootMargin: '0px',
                threshold: 0.15 // Adjust threshold for when element becomes visible
            };

            const observer = new IntersectionObserver((entries, observerInstance) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observerInstance.unobserve(entry.target); // Stop observing after animation for performance
                    }
                });
            }, observerOptions);

            document.querySelectorAll('.animate-on-scroll').forEach(el => {
                observer.observe(el);
            });
            
            // Special observer for SVG
            const svgObserver = new IntersectionObserver((entries, svgObserverInstance) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        svgObserverInstance.unobserve(entry.target); // Only animate once
                    }
                });
            }, { threshold: 0.7 }); // High threshold for SVG
            const processSvg = document.getElementById('process-svg');
            if (processSvg) svgObserver.observe(processSvg);


            // ------------------- //
            // -- PROJECTS FILTER -- //
            // ------------------- //
            const filterBtns = document.querySelectorAll('.filter-btn');
            const projectCards = document.querySelectorAll('.project-card');

            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    const filter = btn.dataset.filter;

                    projectCards.forEach(card => {
                        if (filter === 'all' || card.dataset.category === filter) {
                            card.classList.remove('hide');
                        } else {
                            card.classList.add('hide');
                        }
                    });
                });
            });

            // ------------------- //
            // -- PROJECT MODAL -- //
            // ------------------- //
            const projectModal = document.getElementById('projectModal');
            const modalCloseBtn = document.querySelector('.modal-close');
            const modalBody = document.querySelector('.modal-body');

            const projectDetails = {
                1: {
                    title: "Arcology One: Vertical Living",
                    category: "Residential",
                    date: "2075-2077",
                    location: "Neo-London",
                    image: "images/arcology.png", // store the image path here
                    description: `Arcology One is our flagship residential project, a self-contained vertical city designed to house over 50,000 inhabitants. Its unique bio-skin actively filters pollutants, produces oxygen, and manages internal climate, creating a thriving micro-ecosystem. Each residential unit is connected to communal vertical farms and hydroponic gardens, ensuring sustainable food sources within the structure itself. The building adapts its light filtration and thermal regulation based on real-time environmental data.`,
                    features: [
                        "Self-sustaining ecosystem",
                        "Integrated vertical farming",
                        "Dynamic climate control",
                        "Bio-filtration façade",
                        "Modular living units"
                    ]
                },
                2: {
                    title: "The Hive: Dynamic Commercial Hub",
                    category: "Commercial",
                    date: "2076",
                    location: "Tokyo Delta",
                    image: "images/hive.png", // store the image path here
                    description: `The Hive represents the next generation of commercial architecture. This complex features interconnected, adaptive office modules that can reconfigure their layout and functionality based on tenant needs and daylight optimization. Its biomimetic structure draws inspiration from insect colonies, allowing for efficient energy distribution and internal ventilation through natural convection. The exterior pulsates with bioluminescent panels that generate energy and provide ambient light, reducing reliance on conventional power grids.`,
                    features: [
                        "Adaptive office modules",
                        "Biomimetic energy efficiency",
                        "Bioluminescent power generation",
                        "Modular and reconfigurable spaces",
                        "Advanced bio-filtration systems"
                    ]
                },
                3: {
                    title: "Solaris Pavilion: Public Energy Park",
                    category: "Public",
                    date: "2074",
                    location: "Central Park, New York",
                    image: "images/pavilion.png", // store the image path here
                    description: `The Solaris Pavilion is a breathtaking public installation designed to educate and inspire. Its enormous, organic canopy is comprised of genetically engineered algae panels that perform advanced photosynthesis, generating clean energy for the surrounding urban area. Below, interactive exhibits explain the principles of bio-architecture, while lush, cultivated gardens offer a serene escape. The pavilion demonstrates how large-scale living structures can integrate seamlessly into public spaces, providing both aesthetic beauty and critical environmental services.`,
                    features: [
                        "Photosynthetic energy generation",
                        "Interactive educational exhibits",
                        "Self-purifying water features",
                        "Public green space integration",
                        "Atmospheric carbon capture"
                    ]
                },
                4: {
                        title: "Project Eden: Harmonious Residences",
                        category: "Residential",
                        date: "2073-2075",
                        location: "Pacific Northwest",
                        image: "images/eden.png", // store the image path here
                        description: `Project Eden redefines suburban living by cultivating homes directly from regional flora. Each residence is grown using a unique bio-fabrication process, resulting in structures that are deeply integrated with their natural surroundings. These homes boast active root systems that stabilize soil, natural climate regulation through porous walls, and contribute to local biodiversity. Residents experience unparalleled connection to nature, with structures that literally breathe and grow with their environment.`,
                        features: [
                        "Bio-fabricated, growing homes",
                        "Native flora integration",
                        "Natural climate regulation",
                        "Minimal environmental footprint",
                        "Enhanced biodiversity"
                        ]
                },
                5: {
                    title: "Nova Nexus: Corporate Bio-Campus",
                    category: "Commercial",
                    date: "2076-2078",
                    location: "Silicon Valley",
                    image: "images/camp.png",
                    description: `Nova Nexus is a sprawling corporate bio-campus, designed for companies at the forefront of innovation. Its modular buildings are connected by elevated 'sky-gardens' and bioluminescent pathways, fostering collaboration and employee well-being. The entire campus acts as a single organism, with centralized AI monitoring and optimizing energy flow, waste recycling, and air quality across all structures. It's a living workspace that adapts to the needs of its inhabitants and the planet.`,
                    features: [
                        "Interconnected living structures",
                        "Centralized AI environmental control",
                        "Bioluminescent pathways",
                        "Waste-to-energy conversion",
                        "Dynamic air quality management"
                    ]
                },
                6: {
                    title: "Bio-Dome Labs: Research & Cultivation",
                    category: "Research",
                    date: "2070-Present",
                    location: "Global Research Network",
                    image: "images/dome.png",
                    description: `The Bio-Dome Labs are our network of advanced research facilities, purpose-built for the cultivation and study of new bio-architectural materials and systems. Each dome is a hermetically sealed environment where living structures are grown under accelerated conditions and tested for resilience, adaptability, and sustainability. These labs are crucial for pushing the boundaries of what Aetherium Dynamics can achieve, from drought-resistant facades to self-repairing infrastructure.`,
                    features: [
                        "Accelerated bio-cultivation",
                        "Hermetically sealed research environments",
                        "Material resilience testing",
                        "AI-driven growth optimization",
                        "Modular lab units"
                    ]
                },
                7: {
                    title: "Eco-Corridor: Urban Regeneration",
                    category: "Public",
                    date: "2075",
                    location: "Sao Paulo",
                    image: "images/eco.png",
                    description: `The Eco-Corridor project transformed a congested urban district into a vibrant, living artery. This initiative involved retrofitting existing structures with bio-integrated facades and creating new public spaces that are biologically active. The corridor features self-purifying water channels, biodiverse plant life that attracts local wildlife, and passive cooling systems derived from organic structures. It's a testament to how urban areas can be rewilded and made healthier through thoughtful bio-architecture.`,
                    features: [
                        "Urban rewilding and greening",
                        "Bio-integrated facade retrofits",
                        "Self-purifying water systems",
                        "Enhanced public biodiversity",
                        "Passive cooling infrastructure"
                    ]
                },
                8: {
                    title: "Aether Spire: Climate Adaptive Tower",
                    category: "Residential",
                    date: "2077-Ongoing",
                    location: "Dubai",
                    image: "images/tower.png",
                    description: `The Aether Spire is a monumental residential tower designed to thrive in extreme climates. Its living skin dynamically adjusts its porosity and hydration to regulate internal temperatures and humidity, drastically reducing energy consumption. The spire also features integrated air moisture harvesting and desalinization systems, making it largely self-sufficient for water in arid environments. This project pushes the limits of environmental resilience in living architecture.`,
                    features: [
                        "Dynamic living skin",
                        "Integrated air moisture harvesting",
                        "Desalinization systems",
                        "Extreme climate resilience",
                        "Energy-neutral operation"
                    ]
                }
            };

            projectCards.forEach(card => {
                card.addEventListener('click', () => {
                    const projectId = card.dataset.projectId;
                    const details = projectDetails[projectId];
                    
                    if (details) {
                        modalBody.innerHTML = `
                            <img src="${details.image}" alt="${details.title}">
                            <h3>${details.title}</h3>
                            <div class="project-meta">
                                <span><strong>Category:</strong> ${details.category}</span>
                                <span><strong>Timeline:</strong> ${details.date}</span>
                                <span><strong>Location:</strong> ${details.location}</span>
                            </div>
                            <p>${details.description}</p>
                            <h4>Key Features:</h4>
                            <ul>
                                ${details.features.map(feature => `<li>${feature}</li>`).join('')}
                            </ul>
                        `;
                        projectModal.classList.add('active');
                        document.body.style.overflow = 'hidden'; // Prevent scrolling background
                    }
                });
            });

            modalCloseBtn.addEventListener('click', () => {
                projectModal.classList.remove('active');
                document.body.style.overflow = ''; // Restore scrolling
            });

            // Close modal if clicked outside content
            projectModal.addEventListener('click', (e) => {
                if (e.target === projectModal) {
                    projectModal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });

            // Keyboard accessibility for modal
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && projectModal.classList.contains('active')) {
                    projectModal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });

        });