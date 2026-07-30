import React, { useState, useEffect, useContext } from 'react';
import SEO from '../../components/SEO/SEO';
import { ShopContext } from '../../context/ShopContext';
import { cjApi } from '../../services/cjApi';
import { backupService } from '../../services/backupService';
import { aiService } from '../../services/aiService';
import { formatPrice } from '../../utils/formatter';
import {
  LayoutDashboard,
  RefreshCw,
  FileText,
  CheckCircle2,
  Package,
  Layers,
  TrendingUp,
  Settings,
  Download,
  Upload,
  Search,
  Lock,
  LogOut,
  Sparkles,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Tag,
  ShieldCheck,
  Globe,
  Clock,
  History,
  Mail,
  X
} from 'lucide-react';
import './Admin.css';

const Admin = () => {
  const {
    allProducts,
    orders,
    themeSettings,
    setThemeSettings,
    adminToken,
    adminUser,
    loginAdmin,
    logoutAdmin,
    saveProduct,
    setProductStatus,
    importCjProductToDraft,
    restoreProductVersion,
    deleteProduct,
    showToast
  } = useContext(ShopContext);

  // Tab State: 'overview', 'sync', 'drafts', 'published', 'orders', 'backup', 'theme', 'settings'
  const [activeTab, setActiveTab] = useState('overview');

  // Auth Inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // CJ Catalog Search States
  const [cjKeyword, setCjKeyword] = useState('');
  const [cjResults, setCjResults] = useState([]);
  const [isSearchingCj, setIsSearchingCj] = useState(false);
  const [importPid, setImportPid] = useState('');

  // Product Editor Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [editorTab, setEditorTab] = useState('basic'); // 'basic', 'pricing', 'seo', 'images', 'history'

  // Health Diagnostics
  const [healthStatus, setHealthStatus] = useState(null);

  // Fetch Server Health Status on Load
  useEffect(() => {
    fetch('/health')
      .then((res) => res.json())
      .then((data) => setHealthStatus(data))
      .catch(() => setHealthStatus({ status: 'offline', mode: 'CLIENT_FALLBACK' }));
  }, []);

  // Filtered Product Lists
  const draftProducts = allProducts.filter((p) => p.status !== 'published');
  const publishedProducts = allProducts.filter((p) => p.status === 'published');

  // Handle Login Submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    await loginAdmin(loginEmail, loginPassword);
  };

  // Search Live CJ Catalog
  const handleCjSearch = async () => {
    setIsSearchingCj(true);
    try {
      const res = await cjApi.searchProducts(cjKeyword);
      if (res.list) {
        setCjResults(res.list);
      } else {
        showToast('No products found matching query', 'warning');
      }
    } catch (err) {
      showToast('Failed to search CJ catalog', 'error');
    } finally {
      setIsSearchingCj(false);
    }
  };

  // Direct Import by PID
  const handleDirectImportByPid = async () => {
    if (!importPid.trim()) return;
    try {
      const res = await cjApi.getProductDetail(importPid.trim());
      if (res.data) {
        importCjProductToDraft(res.data);
        setImportPid('');
      } else {
        showToast('Could not find product with PID ' + importPid, 'error');
      }
    } catch (e) {
      showToast('Import error', 'error');
    }
  };

  // Trigger AI Copy Generation in Editor
  const handleGenerateAiCopy = async () => {
    if (!editingProduct) return;
    const luxuryCopy = await aiService.generateLuxuryDescription(editingProduct.name, editingProduct.category);
    setEditingProduct({
      ...editingProduct,
      description: luxuryCopy
    });
    showToast('Generated luxury marketing description with AI!');
  };

  // Render Login Modal if Not Authenticated
  if (!adminToken) {
    return (
      <div className="admin-login-page">
        <SEO title="Admin Control Center Login | Option One Store" description="Maison Executive Admin Control Center for Option One Store." canonical="https://optiononestore.com/admin" />
        <div className="admin-login-card glass-panel shadow-glow">
          <div className="admin-login-header text-center">
            <div className="admin-lock-icon">
              <Lock size={32} color="var(--color-primary)" />
            </div>
            <h2>Option One Store</h2>
            <p className="subtitle">Maison Executive Admin Control Center</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="admin-login-form">
            <div className="form-group icon-input-group">
              <label>Administrator Email</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  placeholder="admin@optiononestore.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group icon-input-group">
              <label>Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block shadow-btn" style={{ marginTop: '1.25rem' }}>
              Authenticate & Access Admin Center
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-block btn-sm"
              style={{ marginTop: '0.85rem' }}
              onClick={() => {
                setLoginEmail('admin@optiononestore.com');
                setLoginPassword('OptionOne@2026!');
                loginAdmin('admin@optiononestore.com', 'OptionOne@2026!');
              }}
            >
              1-Click Admin Demo Login
            </button>
          </form>

          <div className="admin-login-footer text-center" style={{ marginTop: '1.5rem', color: '#70707a' }}>
            <p><small><ShieldCheck size={14} /> JWT Authenticated • Server Security Proxy Active</small></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      {/* Top Header */}
      <header className="admin-topbar glass-panel">
        <div className="topbar-brand">
          <ShieldCheck size={24} color="var(--color-primary)" />
          <span>Option One Store <strong>Admin Hub</strong></span>
        </div>
        <div className="topbar-actions">
          {healthStatus && (
            <span className={`status-pill ${healthStatus.status === 'healthy' ? 'healthy' : 'warning'}`}>
              API: {healthStatus.mode}
            </span>
          )}
          <span className="user-badge">{adminUser?.name || 'Administrator'}</span>
          <button className="btn-logout" onClick={logoutAdmin} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="admin-layout">
        {/* Sidebar Navigation */}
        <aside className="admin-sidebar glass-panel">
          <nav className="sidebar-nav">
            <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              <LayoutDashboard size={18} />
              <span>Overview</span>
            </button>
            <button className={`nav-item ${activeTab === 'sync' ? 'active' : ''}`} onClick={() => setActiveTab('sync')}>
              <RefreshCw size={18} />
              <span>CJ Sync Center</span>
            </button>
            <button className={`nav-item ${activeTab === 'drafts' ? 'active' : ''}`} onClick={() => setActiveTab('drafts')}>
              <FileText size={18} />
              <span>Draft Queue ({draftProducts.length})</span>
            </button>
            <button className={`nav-item ${activeTab === 'published' ? 'active' : ''}`} onClick={() => setActiveTab('published')}>
              <CheckCircle2 size={18} />
              <span>Live Store ({publishedProducts.length})</span>
            </button>
            <button className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
              <Package size={18} />
              <span>Orders & Tracking ({orders.length})</span>
            </button>
            <button className={`nav-item ${activeTab === 'backup' ? 'active' : ''}`} onClick={() => setActiveTab('backup')}>
              <Download size={18} />
              <span>Backup & Recovery</span>
            </button>
            <button className={`nav-item ${activeTab === 'theme' ? 'active' : ''}`} onClick={() => setActiveTab('theme')}>
              <Layers size={18} />
              <span>Theme Customizer</span>
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="admin-main-content">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="tab-pane animate-fade-in">
              <h2 className="pane-title">Executive Dashboard</h2>
              <div className="metrics-grid">
                <div className="metric-card glass-panel">
                  <div className="metric-icon"><TrendingUp size={24} /></div>
                  <div className="metric-info">
                    <span className="label">Total Products</span>
                    <h3 className="value">{allProducts.length}</h3>
                  </div>
                </div>
                <div className="metric-card glass-panel">
                  <div className="metric-icon"><FileText size={24} /></div>
                  <div className="metric-info">
                    <span className="label">Pending Drafts</span>
                    <h3 className="value">{draftProducts.length}</h3>
                  </div>
                </div>
                <div className="metric-card glass-panel">
                  <div className="metric-icon"><CheckCircle2 size={24} /></div>
                  <div className="metric-info">
                    <span className="label">Published Live</span>
                    <h3 className="value">{publishedProducts.length}</h3>
                  </div>
                </div>
                <div className="metric-card glass-panel">
                  <div className="metric-icon"><Package size={24} /></div>
                  <div className="metric-info">
                    <span className="label">Total Orders</span>
                    <h3 className="value">{orders.length}</h3>
                  </div>
                </div>
              </div>

              <div className="dashboard-sections-grid" style={{ marginTop: '2rem' }}>
                <div className="section-card glass-panel">
                  <h3>Backend Proxy & API Status</h3>
                  <p>Check the status of your connection to the official CJ Dropshipping API.</p>
                  <div className="status-list">
                    <div className="status-row">
                      <span>Server Status:</span> <strong>{healthStatus?.status || 'Connecting...'}</strong>
                    </div>
                    <div className="status-row">
                      <span>Operating Mode:</span> <strong>{healthStatus?.mode || 'MOCK'}</strong>
                    </div>
                    <div className="status-row">
                      <span>CJ Credentials Configured:</span> <strong>{healthStatus?.cjApiConfigured ? 'Yes (Live API Key Active)' : 'No (Using Smart Mock Mode)'}</strong>
                    </div>
                    <div className="status-row">
                      <span>Uptime:</span> <strong>{healthStatus?.uptimeSeconds || 0} seconds</strong>
                    </div>
                  </div>
                </div>

                <div className="section-card glass-panel">
                  <h3>Quick Import Product</h3>
                  <p>Import a single item directly from CJ Dropshipping using CJ Product ID (PID).</p>
                  <div className="quick-import-form">
                    <input
                      type="text"
                      placeholder="e.g. CJ-PRD-9001"
                      value={importPid}
                      onChange={(e) => setImportPid(e.target.value)}
                    />
                    <button className="btn btn-primary shadow-btn" onClick={handleDirectImportByPid}>
                      Import as Draft
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CJ SYNC CENTER */}
          {activeTab === 'sync' && (
            <div className="tab-pane animate-fade-in">
              <h2 className="pane-title">CJ Dropshipping Catalog Search & Import</h2>
              <p className="pane-description">
                Search the live CJ Dropshipping catalog. Products imported here enter as <strong>Drafts</strong> and are never shown publicly until approved and published by Admin.
              </p>

              <div className="search-bar-row glass-panel">
                <Search size={20} />
                <input
                  type="text"
                  placeholder="Search CJ catalog (e.g. watch, handbag, earbuds)..."
                  value={cjKeyword}
                  onChange={(e) => setCjKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCjSearch()}
                />
                <button className="btn btn-primary shadow-btn" onClick={handleCjSearch} disabled={isSearchingCj}>
                  {isSearchingCj ? 'Searching...' : 'Search CJ Catalog'}
                </button>
              </div>

              <div className="results-grid" style={{ marginTop: '1.5rem' }}>
                {cjResults.map((cjItem) => (
                  <div key={cjItem.pid} className="cj-result-card glass-panel">
                    <img src={cjItem.productImage} alt={cjItem.productName} className="cj-thumb" />
                    <div className="cj-info">
                      <span className="cj-category">{cjItem.categoryName || 'General'}</span>
                      <h4 className="cj-title">{cjItem.productName}</h4>
                      <p className="cj-sku">SKU: {cjItem.productSku}</p>
                      <div className="cj-price-row">
                        <span>Cost: <strong>${cjItem.costPrice}</strong></span>
                        <span>Stock: <strong>{cjItem.stock}</strong></span>
                      </div>
                      <button
                        className="btn btn-primary btn-sm btn-block shadow-btn"
                        onClick={() => importCjProductToDraft(cjItem)}
                      >
                        Import to Drafts
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DRAFT QUEUE */}
          {activeTab === 'drafts' && (
            <div className="tab-pane animate-fade-in">
              <h2 className="pane-title">Draft Products Queue ({draftProducts.length})</h2>
              <p className="pane-description">
                Review, edit, set custom prices, and publish products. <strong>Zero draft products are visible to shoppers.</strong>
              </p>

              {draftProducts.length === 0 ? (
                <div className="empty-panel glass-panel text-center">
                  <FileText size={48} color="var(--color-primary)" />
                  <h3>No draft products pending review</h3>
                  <p>Use the CJ Sync Center to search and import products.</p>
                </div>
              ) : (
                <div className="table-responsive glass-panel">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Product Name</th>
                        <th>Source</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {draftProducts.map((p) => (
                        <tr key={p.id}>
                          <td>
                            <img src={p.image1} alt={p.name} className="table-thumb" />
                          </td>
                          <td>
                            <strong>{p.name}</strong>
                            <br />
                            <small className="text-muted">SKU: {p.sku}</small>
                          </td>
                          <td>
                            <span className="source-badge">{p.source || 'cj'}</span>
                          </td>
                          <td>{formatPrice(p.price)}</td>
                          <td>{p.stock}</td>
                          <td>
                            <span className="status-badge draft">{p.status}</span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn-icon"
                                title="Edit Product Details"
                                onClick={() => setEditingProduct({ ...p })}
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                className="btn btn-success btn-xs"
                                title="Publish to Live Store"
                                onClick={() => setProductStatus(p.id, 'published')}
                              >
                                Publish
                              </button>
                              <button
                                className="btn-icon text-danger"
                                title="Delete Product"
                                onClick={() => deleteProduct(p.id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PUBLISHED CATALOG */}
          {activeTab === 'published' && (
            <div className="tab-pane animate-fade-in">
              <h2 className="pane-title">Published Live Storefront Products ({publishedProducts.length})</h2>
              <p className="pane-description">These products are active and live on Option One Store.</p>

              <div className="table-responsive glass-panel">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Selling Price</th>
                      <th>Stock</th>
                      <th>Placements</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {publishedProducts.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <img src={p.image1} alt={p.name} className="table-thumb" />
                        </td>
                        <td>
                          <strong>{p.name}</strong>
                          <br />
                          <small className="text-muted">Brand: {p.brand}</small>
                        </td>
                        <td>{p.category}</td>
                        <td>{formatPrice(p.price)}</td>
                        <td>{p.stock}</td>
                        <td>
                          <div className="placement-tags">
                            {p.isFeatured && <span className="tag featured">Featured</span>}
                            {p.isBestSeller && <span className="tag bestseller">Best Seller</span>}
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-icon"
                              title="Edit Product"
                              onClick={() => setEditingProduct({ ...p })}
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              className="btn btn-warning btn-xs"
                              title="Unpublish to Draft"
                              onClick={() => setProductStatus(p.id, 'draft')}
                            >
                              Unpublish
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: ORDERS */}
          {activeTab === 'orders' && (
            <div className="tab-pane animate-fade-in">
              <h2 className="pane-title">Store Orders & Fulfillment ({orders.length})</h2>
              {orders.length === 0 ? (
                <div className="empty-panel glass-panel text-center">
                  <Package size={48} color="var(--color-primary)" />
                  <h3>No orders recorded yet</h3>
                </div>
              ) : (
                <div className="table-responsive glass-panel">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Payment</th>
                        <th>Status</th>
                        <th>CJ Order / Tracking</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.orderId}>
                          <td><strong>{o.orderId}</strong></td>
                          <td>
                            {o.customerName}
                            <br />
                            <small className="text-muted">{o.customerEmail}</small>
                          </td>
                          <td>{o.orderDate || 'Recent'}</td>
                          <td>{formatPrice(o.totalAmount)}</td>
                          <td><span className="payment-badge">{o.paymentMethod}</span></td>
                          <td><span className="status-badge">{o.status}</span></td>
                          <td>
                            <small>{o.cjOrderId || 'N/A'}</small>
                            <br />
                            <small className="text-muted">{o.trackingNumber || 'No tracking'}</small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: BACKUP & RECOVERY */}
          {activeTab === 'backup' && (
            <div className="tab-pane animate-fade-in">
              <h2 className="pane-title">Backup & Recovery Management</h2>
              <div className="backup-cards-grid">
                <div className="backup-card glass-panel">
                  <h3>Export Catalog (JSON)</h3>
                  <p>Download complete JSON dump of all product data, draft statuses, and version histories.</p>
                  <button className="btn btn-primary shadow-btn" onClick={backupService.exportCatalogJson}>
                    <Download size={16} /> Export Catalog JSON
                  </button>
                </div>

                <div className="backup-card glass-panel">
                  <h3>Export Orders (CSV)</h3>
                  <p>Download full customer orders history spreadsheet in CSV format.</p>
                  <button className="btn btn-primary shadow-btn" onClick={backupService.exportOrdersCsv}>
                    <Download size={16} /> Export Orders CSV
                  </button>
                </div>

                <div className="backup-card glass-panel">
                  <h3>Restore Catalog from Backup</h3>
                  <p>Upload JSON catalog backup file to restore product data.</p>
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const res = backupService.restoreCatalogFromJson(event.target.result);
                          if (res.success) {
                            showToast(`Successfully restored ${res.count} products from JSON backup!`);
                            window.location.reload();
                          } else {
                            showToast(res.message, 'error');
                          }
                        };
                        reader.readAsText(file);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: THEME CUSTOMIZER */}
          {activeTab === 'theme' && (
            <div className="tab-pane animate-fade-in">
              <h2 className="pane-title">Theme Customizer</h2>
              <div className="theme-editor-form glass-panel">
                <div className="form-group">
                  <label>Announcement Bar Text</label>
                  <input
                    type="text"
                    value={themeSettings.announcementText || ''}
                    onChange={(e) => setThemeSettings({ ...themeSettings, announcementText: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Store Subtitle Header</label>
                  <input
                    type="text"
                    value={themeSettings.logoSubtitle || ''}
                    onChange={(e) => setThemeSettings({ ...themeSettings, logoSubtitle: e.target.value })}
                  />
                </div>
                <button className="btn btn-primary shadow-btn" onClick={() => showToast('Theme settings saved!')}>
                  Save Theme Changes
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* SHOPIFY-GRADE PRODUCT EDITOR MODAL */}
      {editingProduct && (
        <div className="editor-modal-overlay">
          <div className="editor-modal-content glass-panel animate-scale">
            <div className="editor-modal-header">
              <h3>Edit Product: <strong>{editingProduct.name}</strong></h3>
              <button className="close-btn" onClick={() => setEditingProduct(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="editor-tabs">
              <button className={`tab-btn ${editorTab === 'basic' ? 'active' : ''}`} onClick={() => setEditorTab('basic')}>Basic Info</button>
              <button className={`tab-btn ${editorTab === 'pricing' ? 'active' : ''}`} onClick={() => setEditorTab('pricing')}>Pricing Formula</button>
              <button className={`tab-btn ${editorTab === 'seo' ? 'active' : ''}`} onClick={() => setEditorTab('seo')}>SEO & Meta</button>
              <button className={`tab-btn ${editorTab === 'history' ? 'active' : ''}`} onClick={() => setEditorTab('history')}>Version History</button>
            </div>

            <div className="editor-modal-body">
              {editorTab === 'basic' && (
                <div className="editor-pane">
                  <div className="form-group">
                    <label>Product Title</label>
                    <input
                      type="text"
                      value={editingProduct.name || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Brand</label>
                      <input
                        type="text"
                        value={editingProduct.brand || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <input
                        type="text"
                        value={editingProduct.category || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="label-with-ai">
                      <label>Luxury Marketing Description</label>
                      <button className="btn-ai-sparkle" onClick={handleGenerateAiCopy}>
                        <Sparkles size={14} /> AI Luxury Copywriter
                      </button>
                    </div>
                    <textarea
                      rows={5}
                      value={editingProduct.description || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    />
                  </div>

                  <div className="toggles-grid">
                    <label><input type="checkbox" checked={Boolean(editingProduct.isFeatured)} onChange={(e) => setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })} /> Featured</label>
                    <label><input type="checkbox" checked={Boolean(editingProduct.isBestSeller)} onChange={(e) => setEditingProduct({ ...editingProduct, isBestSeller: e.target.checked })} /> Best Seller</label>
                    <label><input type="checkbox" checked={Boolean(editingProduct.isNewArrival)} onChange={(e) => setEditingProduct({ ...editingProduct, isNewArrival: e.target.checked })} /> New Arrival</label>
                    <label><input type="checkbox" checked={Boolean(editingProduct.isTrending)} onChange={(e) => setEditingProduct({ ...editingProduct, isTrending: e.target.checked })} /> Trending</label>
                  </div>
                </div>
              )}

              {editorTab === 'pricing' && (
                <div className="editor-pane">
                  <div className="form-row">
                    <div className="form-group">
                      <label>CJ Cost Price ($)</label>
                      <input
                        type="number"
                        value={editingProduct.costPrice || 20}
                        onChange={(e) => setEditingProduct({ ...editingProduct, costPrice: Number(e.target.value) })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Margin (%)</label>
                      <input
                        type="number"
                        value={editingProduct.marginPercent || 30}
                        onChange={(e) => setEditingProduct({ ...editingProduct, marginPercent: Number(e.target.value) })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Selling Price (PKR)</label>
                      <input
                        type="number"
                        value={editingProduct.price || 1000}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {editorTab === 'seo' && (
                <div className="editor-pane">
                  <div className="form-group">
                    <label>SEO Title Tag</label>
                    <input
                      type="text"
                      value={editingProduct.seoTitle || editingProduct.name || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, seoTitle: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Meta Description</label>
                    <textarea
                      rows={3}
                      value={editingProduct.seoDescription || editingProduct.shortDescription || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, seoDescription: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {editorTab === 'history' && (
                <div className="editor-pane">
                  <h4>Version Snapshots</h4>
                  {(editingProduct.versions || []).map((v) => (
                    <div key={v.versionId} className="version-row">
                      <span>Version {v.versionId} ({new Date(v.savedAt).toLocaleString()})</span>
                      <button
                        className="btn btn-xs btn-primary"
                        onClick={() => {
                          restoreProductVersion(editingProduct.id, v.versionId);
                          setEditingProduct(null);
                        }}
                      >
                        Restore Version {v.versionId}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="editor-modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditingProduct(null)}>Cancel</button>
              <button
                className="btn btn-primary shadow-btn"
                onClick={() => {
                  saveProduct(editingProduct);
                  setEditingProduct(null);
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
