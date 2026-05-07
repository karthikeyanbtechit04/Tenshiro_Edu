import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaArrowRight, FaSearch } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

const DomainRoles = () => {
    const { t } = useLanguage();
    const { id } = useParams(); // domainId
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const res = await axios.get(`/api/domains/${id}/roles`);
                setRoles(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchRoles();
    }, [id]);

    const filteredRoles = roles.filter(role =>
        role.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div>{t('domains.loading')}</div>;

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>{t('domains.selectRole')}</h1>

            {/* Search Bar */}
            <div style={{ marginBottom: '2rem', position: 'relative', maxWidth: '500px' }}>
                <input
                    type="text"
                    className="input"
                    placeholder={t('domains.searchRoles')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        padding: '1rem 1rem 1rem 3.5rem', 
                        borderRadius: '16px',
                        backgroundColor: 'var(--bg-card)', 
                        fontSize: '1.05rem',
                        boxShadow: 'var(--shadow)'
                    }}
                />
                <FaSearch style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1.1rem' }} />
            </div>

            <div className="role-grid" style={{ gap: '1.5rem' }}>
                {filteredRoles.map((role) => (
                    <div key={role.id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <h3>{role.title}</h3>
                            <span style={{
                                padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem',
                                background: role.demand_indicator === 'High' ? 'rgba(26, 50, 99, 0.1)' : 'rgba(255, 193, 7, 0.1)',
                                color: role.demand_indicator === 'High' ? 'var(--success)' : 'var(--warning)'
                            }}>
                                {t('domains.demand', { level: role.demand_indicator })}
                            </span>
                        </div>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{role.description}</p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
                            <span>{t('domains.fresher')}: {role.salary_fresher ? role.salary_fresher.replace(/Ôé╣\s*/g, '₹') : ''}</span>
                            <span>{t('domains.senior')}: {role.salary_senior ? role.salary_senior.replace(/Ôé╣\s*/g, '₹') : ''}</span>
                        </div>

                        {/* Updated Link to RoleAccess Page */}
                        <Link to={`/roles/${role.id}`} className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                            {t('domains.viewMore')} <FaArrowRight />
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DomainRoles;
