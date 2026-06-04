import React from 'react';
import '../App.css';
import cocofarm from '../../src/images/cocofarm.jpg';

const missions = [
    { icon: '🧑‍🌾', title: 'Empower Farmers',     desc: 'Ethical sourcing & fair trade practices across the supply chain.' },
    { icon: '🌴', title: 'Promote Sustainability', desc: 'Eco-friendly coconut alternatives for a greener planet.' },
    { icon: '🚚', title: 'Deliver Quality',        desc: 'Finest coconut-derived products straight to your door.' },
    { icon: '🏆', title: 'Simplify Business',      desc: 'Digital marketplace solutions for modern trade.' },
];

const products = [
    { icon: '🥥', title: 'Edible Products',    items: ['Organic Coconut Oil', 'Coconut Milk & Flour', 'Desiccated Coconut', 'Coco Cream', 'Coconut Sugar'] },
    { icon: '🪵', title: 'Shell & Fiber',      items: ['Coconut Shell Cups', 'Coconut Shell Spoons', 'Shell Charcoal', 'Fiber Rope', 'Coconut Husk'] },
    { icon: '🌿', title: 'Organic Essentials', items: ['Raw Coconut Milk', 'Virgin Coconut Oil', 'Coconut Water', 'Coconut Powder', 'Natural Coir'] },
    { icon: '📦', title: 'Bulk & Export',      items: ['Wholesale Packages', 'Export-Grade Oil', 'Bulk Desiccated', 'Coir Products', 'Custom Blends'] },
];

const reasons = [
    { icon: '🌟', title: 'Premium Quality',         desc: 'Ethically sourced, natural, and 100% organic products.' },
    { icon: '♻️', title: 'Sustainable Practices',   desc: 'Biodegradable packaging & eco-friendly solutions.' },
    { icon: '🌍', title: 'Global Reach',             desc: 'Worldwide delivery for homes, restaurants & businesses.' },
];

function AboutUs() {
    return (
        <div>
            {/* Hero */}
            <section className="about-hero">
                <h1>🥥 CocoHub</h1>
                <p className="lead">Your Trusted Marketplace for Premium Coconut-Based Products</p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
                    <a href="/add" style={{
                        background: 'rgba(255,255,255,0.2)', color: '#fff',
                        padding: '0.75rem 1.8rem', borderRadius: '999px',
                        border: '2px solid rgba(255,255,255,0.5)',
                        fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem',
                        backdropFilter: 'blur(8px)',
                        transition: 'all 0.3s ease'
                    }}>✍️ Add Review</a>
                    <a href="/feedback" style={{
                        background: '#fff', color: '#047857',
                        padding: '0.75rem 1.8rem', borderRadius: '999px',
                        border: '2px solid transparent',
                        fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                        transition: 'all 0.3s ease'
                    }}>📋 View Feedbacks</a>
                </div>
            </section>

            <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>

                {/* Who We Are */}
                <section style={{ margin: '3.5rem 0' }}>
                    <h2 style={{ fontFamily: 'Outfit, sans-serif', color: '#047857', fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem' }}>
                        Who We Are
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2.5rem', alignItems: 'center' }}>
                        <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: '#374151' }}>
                            CocoHub is a premier e-commerce platform dedicated to promoting the coconut industry
                            by offering organic, eco-friendly, and sustainable coconut products. We bridge the
                            gap between coconut farmers and conscious consumers — creating a transparent,
                            fair-trade digital marketplace where quality meets integrity.
                        </p>
                        <img
                            src={cocofarm}
                            alt="Coconut Farm"
                            style={{
                                width: '100%', height: 220, objectFit: 'cover',
                                borderRadius: 16, boxShadow: '0 12px 30px rgba(0,0,0,0.12)'
                            }}
                        />
                    </div>
                </section>

                {/* Mission */}
                <section style={{ margin: '3rem 0' }}>
                    <h2 style={{ fontFamily: 'Outfit, sans-serif', color: '#047857', fontSize: '1.8rem', fontWeight: 800, textAlign: 'center', marginBottom: '2rem' }}>
                        Our Mission
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                        {missions.map((m) => (
                            <div key={m.title} style={{
                                background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(5,150,105,0.18)', borderRadius: 16,
                                padding: '1.6rem 1.25rem', textAlign: 'center',
                                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                                transition: 'all 0.3s ease',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(5,150,105,0.18)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'; }}
                            >
                                <div className="feature-icon">{m.icon}</div>
                                <h5 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: '#1a1a2e', marginBottom: '0.5rem' }}>{m.title}</h5>
                                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0, lineHeight: 1.6 }}>{m.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Products */}
                <section style={{ margin: '3rem 0' }}>
                    <h2 style={{ fontFamily: 'Outfit, sans-serif', color: '#047857', fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem' }}>
                        Our Product Range
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem' }}>
                        {products.map((p) => (
                            <div key={p.title} style={{
                                background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)',
                                border: '1.5px solid rgba(5,150,105,0.2)', borderRadius: 16,
                                padding: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                                transition: 'all 0.3s ease',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#059669'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(5,150,105,0.2)'; }}
                            >
                                <h5 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: '#047857', fontSize: '1.05rem', marginBottom: '0.75rem' }}>
                                    {p.icon} {p.title}
                                </h5>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {p.items.map(item => (
                                        <li key={item} style={{
                                            fontSize: '0.875rem', color: '#4b5563',
                                            padding: '4px 0', borderBottom: '1px solid rgba(5,150,105,0.08)',
                                            display: 'flex', alignItems: 'center', gap: '6px'
                                        }}>
                                            <span style={{ color: '#10b981', fontSize: '0.6rem' }}>●</span> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Why Choose Us */}
                <section style={{ margin: '3rem 0 4rem' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(4,120,87,0.92), rgba(5,150,105,0.88))',
                        borderRadius: 20, padding: '2.5rem 2rem',
                        boxShadow: '0 12px 30px rgba(5,150,105,0.3)',
                        color: '#fff'
                    }}>
                        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.8rem', marginBottom: '2rem', textAlign: 'center' }}>
                            Why Choose CocoHub?
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                            {reasons.map((r) => (
                                <div key={r.title} style={{
                                    background: 'rgba(255,255,255,0.12)',
                                    backdropFilter: 'blur(8px)',
                                    borderRadius: 12, padding: '1.4rem',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    transition: 'all 0.3s ease'
                                }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                                >
                                    <div style={{ fontSize: '1.8rem', marginBottom: '0.6rem' }}>{r.icon}</div>
                                    <h5 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, marginBottom: '0.4rem' }}>{r.title}</h5>
                                    <p style={{ fontSize: '0.875rem', opacity: 0.88, margin: 0, lineHeight: 1.6 }}>{r.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default AboutUs;