"use client";

import { sourceSiteLabel, FORM_TYPES } from "./LeadTable";

function formTypeLabel(value) {
  if (!value) return "—";
  const found = FORM_TYPES.find((f) => f.value === value);
  if (found?.label && found.value) return found.label;
  return value.replace(/_/g, " ");
}

function DetailField({ label, value, full = false }) {
  if (!value) return null;
  return (
    <div className={full ? "leads-detail-full" : undefined}>
      <dt>{label}</dt>
      <dd className={full ? "leads-message-box" : undefined}>{value}</dd>
    </div>
  );
}

function productTypes(lead) {
  const types = [
    lead.product_physical ? "Physical Product" : null,
    lead.product_digital ? "Digital Product" : null,
    lead.product_subscription ? "Subscription" : null,
  ].filter(Boolean);
  return types.length ? types.join(", ") : null;
}

function amazonServices(lead) {
  const types = [
    lead.svc_account_management ? "Account Management" : null,
    lead.svc_ppc_management ? "PPC Management" : null,
    lead.svc_listing_creation ? "Listing Creation" : null,
    lead.svc_listing_optimization ? "Listing Optimization" : null,
    lead.svc_a_plus_content ? "A+ Content" : null,
    lead.svc_brand_store ? "Brand Store" : null,
    lead.svc_inventory_management ? "Inventory Management" : null,
    lead.svc_reimbursements ? "Reimbursements" : null,
  ].filter(Boolean);
  return types.length ? types.join(", ") : null;
}

export default function LeadDetailModal({ lead, onClose }) {
  if (!lead) return null;

  const isShopify = lead.lead_source === "shopify_intake";
  const isAmazonOnboarding = lead.lead_source === "amazon_onboarding";
  const isAmazonLeads =
    lead.lead_source === "amazon_leads" || lead.form_type === "amazon_leads";
  const isSpecialForm = isShopify || isAmazonOnboarding || isAmazonLeads;

  return (
    <div className="leads-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="leads-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="lead-modal-title"
      >
        <div className="leads-modal-head">
          <h2 id="lead-modal-title">{lead.name}</h2>
          <button type="button" className="leads-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="leads-modal-body">
          <dl className="leads-detail-grid">
            <div>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${lead.email}`}>{lead.email}</a>
              </dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{lead.phone || "—"}</dd>
            </div>
            {!isSpecialForm && lead.company ? (
              <div>
                <dt>Company</dt>
                <dd>{lead.company}</dd>
              </div>
            ) : null}
            {!isSpecialForm && lead.ai_product ? (
              <div>
                <dt>AI product</dt>
                <dd>{lead.ai_product}</dd>
              </div>
            ) : null}
            <div>
              <dt>Country</dt>
              <dd>{lead.country || "—"}</dd>
            </div>
            <div>
              <dt>Web form</dt>
              <dd>
                <span className="leads-pill" data-form={lead.form_type}>
                  {formTypeLabel(lead.form_type)}
                </span>
              </dd>
            </div>
            <div>
              <dt>Website</dt>
              <dd>{sourceSiteLabel(lead.source_site)}</dd>
            </div>
            <div>
              <dt>Source page</dt>
              <dd>{lead.source_page || "—"}</dd>
            </div>
            <div>
              <dt>Submitted</dt>
              <dd>
                {lead.created_at
                  ? new Date(lead.created_at).toLocaleString()
                  : "—"}
              </dd>
            </div>

            {isAmazonOnboarding ? (
              <>
                <DetailField label="Company" value={lead.company_name} />
                <DetailField label="Brand" value={lead.brand_name} />
                <DetailField label="Contact person" value={lead.contact_person} />
                <DetailField label="Website" value={lead.website} />
                <DetailField label="Seller Central URL" value={lead.seller_central_url} />
                <DetailField label="Brand store URL" value={lead.brand_store_url} />
                <DetailField label="Seller ID" value={lead.seller_id} />
                <DetailField label="Marketplace" value={lead.marketplace} />
                <DetailField label="Fulfilment" value={lead.fulfilment} />
                <DetailField label="Top product URLs" value={lead.top_product_urls} full />
                <DetailField label="Competitor URLs" value={lead.top_competitor_urls} full />
                <DetailField label="Total SKUs" value={lead.total_skus} />
                <DetailField label="Monthly revenue" value={lead.monthly_revenue} />
                <DetailField label="Services required" value={amazonServices(lead)} full />
                <DetailField label="Current ad spend" value={lead.current_ad_spend} />
                <DetailField label="Target ad budget" value={lead.target_ad_budget} />
                <DetailField label="Current ACOS" value={lead.current_acos} />
                <DetailField label="Target ACOS" value={lead.target_acos} />
                <DetailField label="Advertising challenges" value={lead.advertising_challenges} full />
                <DetailField label="Business goals" value={lead.business_goals} full />
              </>
            ) : isShopify ? (
              <>
                <DetailField label="Business name" value={lead.business_name} />
                <DetailField label="Website" value={lead.website} />
                <DetailField
                  label="Business description"
                  value={lead.business_description}
                  full
                />
                <DetailField label="Brand mission" value={lead.brand_mission} full />
                <DetailField label="Problem solved" value={lead.problem_solved} full />
                <DetailField label="Brand personality" value={lead.personality} />
                <DetailField label="Product categories" value={lead.categories} full />
                <DetailField label="Best sellers" value={lead.best_sellers} full />
                <DetailField label="Average product price" value={lead.avg_price} />
                <DetailField label="Product types" value={productTypes(lead)} />
                <DetailField label="Audience interests" value={lead.audience_interests} full />
                <DetailField label="Pain points" value={lead.pain_points} full />
                <DetailField label="Customer goals" value={lead.customer_goals} full />
                <DetailField label="Competitor 1" value={lead.competitor1} />
                <DetailField label="Competitor 2" value={lead.competitor2} />
                <DetailField label="Competitor 3" value={lead.competitor3} />
                <DetailField label="Amazon store" value={lead.amazon_store} />
                <DetailField label="Top ASINs" value={lead.top_asins} full />
                <DetailField label="Amazon monthly revenue" value={lead.amazon_revenue} />
                <DetailField label="Additional notes" value={lead.notes} full />
              </>
            ) : isAmazonLeads ? (
              <>
                <DetailField
                  label="Amazon store link"
                  value={lead.store_link}
                  full
                />
                <DetailField
                  label="Message"
                  value={lead.message}
                  full
                />
              </>
            ) : (
              <div className="leads-detail-full">
                <dt>Message</dt>
                <dd className="leads-message-box">{lead.message || "—"}</dd>
              </div>
            )}
          </dl>
        </div>
        <div className="leads-modal-foot">
          <button type="button" className="leads-btn leads-btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
