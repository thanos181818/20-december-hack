import datetime

# --- MOCK ODOO ENVIRONMENT ---
# This simulates the 'self.env' behavior of Odoo
class MockDatabase:
    def __init__(self):
        self.purchase_orders = []
        self.requisitions = []
        self.partners = {
            1: {'id': 1, 'name': 'Global Fabrics Corp'},
            2: {'id': 2, 'name': 'Eco-Dye Solutions'}
        }
        self.products = {
            101: {'id': 101, 'name': 'Cotton T-Shirt S', 'price': 15.0, 'uom': 'Units'},
            102: {'id': 102, 'name': 'Organic Silk Scarf', 'price': 45.0, 'uom': 'Units'}
        }

db = MockDatabase()

# --- THE LOGIC (Extracted and Adapted from requisition.py) ---
def run_requisition_inference(req_id):
    """
    Simulates the action_approve_po_requisition method.
    It groups lines by vendor and creates separate POs.
    """
    # 1. Fetch the requisition
    requisition = next((r for r in db.requisitions if r['id'] == req_id), None)
    if not requisition or requisition['state'] != 'draft':
        return "Requisition not found or already processed."

    print(f"\n--- Processing Requisition: {requisition['name']} ---")
    
    lines = requisition['order_lines']
    if not lines:
        return "No lines to process."

    # 2. Identify Unique Partners (Vendors) across all lines
    unique_partner_ids = list(set(line['partner_id'] for line in lines))
    
    created_pos = []

    # 3. Create a Purchase Order for each unique partner
    for partner_id in unique_partner_ids:
        partner_name = db.partners[partner_id]['name']
        print(f"Generating PO for Vendor: {partner_name}...")

        # Filter lines belonging to this partner
        partner_lines = [l for l in lines if l['partner_id'] == partner_id]
        
        po_id = len(db.purchase_orders) + 1
        new_po = {
            'id': po_id,
            'name': f"PO00{po_id}",
            'requisition_id': req_id,
            'partner_id': partner_id,
            'date_order': datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'order_lines': []
        }

        # Add lines to this specific PO
        for line in partner_lines:
            product = db.products[line['product_id']]
            po_line = {
                'name': product['name'],
                'product_id': line['product_id'],
                'qty': line['product_qty'],
                'price_unit': product['price'],
                'subtotal': line['product_qty'] * product['price']
            }
            new_po['order_lines'].append(po_line)
        
        db.purchase_orders.append(new_po)
        created_pos.append(new_po)

    # 4. Update Requisition State
    requisition['state'] = 'approve'
    
    return created_pos

# --- SAMPLE DATA GENERATION ---
def setup_sample_data():
    # Create a mock requisition
    sample_req = {
        'id': 1,
        'name': 'REQ001',
        'state': 'draft',
        'order_lines': [
            # Line for Vendor 1
            {'product_id': 101, 'product_qty': 100, 'partner_id': 1}, 
            # Another line for Vendor 1
            {'product_id': 102, 'product_qty': 20, 'partner_id': 1},
            # Line for Vendor 2
            {'product_id': 101, 'product_qty': 50, 'partner_id': 2}
        ]
    }
    db.requisitions.append(sample_req)

# --- MAIN RUNNER ---
if __name__ == "__main__":
    setup_sample_data()
    
    # Run the "Inference"
    pos = run_requisition_inference(1)
    
    # OUTPUT RESULTS
    print("\n" + "="*40)
    print("INFERENCE RESULTS: PURCHASE ORDERS CREATED")
    print("="*40)
    for po in pos:
        vendor = db.partners[po['partner_id']]['name']
        print(f"\nOrder Ref: {po['name']}")
        print(f"Vendor:    {vendor}")
        print("-" * 20)
        total = 0
        for line in po['order_lines']:
            print(f"- {line['name']}: {line['qty']} units @ ${line['price_unit']}")
            total += line['subtotal']
        print(f"Total: ${total}")