<script lang="ts">
    import { fade, fly } from 'svelte/transition';
</script>

<svelte:head>
    <title>Calendraw - Digital Drawing Made Simple</title>
    <meta
        name="description"
        content="A powerful yet simple digital drawing and annotation tool for creating beautiful calendars"
    />
    <meta
        name="keywords"
        content="digital drawing, calendar, sketching, online drawing tool, creative calendar"
    />
    <meta
        property="og:title"
        content="Calendraw - Digital Drawing Made Simple"
    />
    <meta
        property="og:description"
        content="A powerful yet simple digital drawing and annotation tool for creating beautiful calendars"
    />
    <meta property="og:url" content="https://calendar.devanshwalia.com/" />
    <link rel="canonical" href="https://calendar.devanshwalia.com/" />
    <meta property="og:type" content="website" />
    <link
        href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;600&display=swap"
        rel="stylesheet"
    />
    <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Calendraw",
            "description": "A powerful yet simple digital drawing and annotation tool for creating beautiful calendars",
            "applicationCategory": "DesignApplication",
            "operatingSystem": "Web",
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
            },
            "author": {
                "@type": "Person",
                "name": "Devansh Walia",
                "url": "https://devanshwalia.com"
            }
        }
    </script>
</svelte:head>

<main>
    <section class="hero" in:fade>
        <h1>Welcome to Calendraw</h1>
        <p class="tagline">Calendar made Digital</p>
        <div class="cta-buttons">
            <a href="/calender" class="cta-primary">Start Drawing</a>
            <a href="#features" class="cta-secondary">Learn More</a>
        </div>
    </section>

    <section id="features" class="features">
        <h2>Features</h2>
        <div class="feature-grid">
            <div
                class="feature-card"
                in:fly={{ y: 50, duration: 1000, delay: 200 }}
            >
                <img src="/pen.svg" alt="Drawing Tools" class="feature-icon" />
                <h3>Drawing Tools</h3>
                <p>
                    Express yourself with customizable pen tools, colors, and
                    stroke widths
                </p>
            </div>
            <div
                class="feature-card"
                in:fly={{ y: 50, duration: 1000, delay: 400 }}
            >
                <img src="/eraser.svg" alt="Eraser Tool" class="feature-icon" />
                <h3>Smart Eraser</h3>
                <p>
                    Precise erasing with adjustable size for perfect corrections
                </p>
            </div>
            <!-- <div
                class="feature-card"
                in:fly={{ y: 50, duration: 1000, delay: 600 }}
            >
                <span class="feature-icon text-tool">T</span>
                <h3>Text Annotations</h3>
                <p>Add text annotations with customizable fonts and sizes</p>
            </div> -->
            <div
                class="feature-card"
                in:fly={{ y: 50, duration: 1000, delay: 800 }}
            >
                <span class="feature-icon hand-tool">✋</span>
                <h3>Easy Navigation</h3>
                <p>Zoom, pan, and move elements with intuitive hand tool</p>
            </div>
        </div>
    </section>
</main>

<style>
    main {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
    }

    .hero {
        text-align: center;
        padding: 4rem 1rem;
        margin-bottom: 4rem;
    }

    h1 {
        font-family: 'Chakra Petch', sans-serif;
        font-size: 3.5rem;
        font-weight: 600;
        margin-bottom: 1rem;
        background: linear-gradient(135deg, #2563eb, #7c3aed);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .tagline {
        font-size: 1.5rem;
        color: #4b5563;
        margin-bottom: 2rem;
    }

    .cta-buttons {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 2rem;
    }

    .cta-primary,
    .cta-secondary {
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        font-weight: 500;
        text-decoration: none;
        transition: transform 0.2s;
    }

    .cta-primary {
        background: #2563eb;
        color: white;
    }

    .cta-secondary {
        border: 2px solid #2563eb;
        color: #2563eb;
    }

    .cta-primary:hover,
    .cta-secondary:hover {
        transform: translateY(-2px);
    }

    .features {
        padding: 4rem 0;
    }

    h2 {
        text-align: center;
        font-size: 2.5rem;
        margin-bottom: 3rem;
        color: #1f2937;
    }

    .feature-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 2rem;
        padding: 0 1rem;
    }

    .feature-card {
        background: white;
        padding: 2rem;
        border-radius: 1rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        text-align: center;
        transition: transform 0.2s;
    }

    .feature-card:hover {
        transform: translateY(-5px);
    }

    .feature-icon {
        width: 48px;
        height: 48px;
        margin-bottom: 1rem;
    }

    .text-tool {
        font-size: 2rem;
        font-weight: bold;
        color: #2563eb;
    }

    .hand-tool {
        font-size: 2rem;
    }

    h3 {
        font-size: 1.25rem;
        margin-bottom: 0.5rem;
        color: #1f2937;
    }

    .feature-card p {
        color: #4b5563;
        line-height: 1.5;
    }

    @media (max-width: 768px) {
        h1 {
            font-size: 2.5rem;
        }

        .tagline {
            font-size: 1.25rem;
        }

        .feature-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
