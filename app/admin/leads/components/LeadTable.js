export default function LeadTable({ leads, onEdit, onDelete }) {
  return (
    <table id="leadTable" className="display nowrap">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Country</th>
          <th>Phone</th>
          <th>Message</th>
          <th>Form Type</th>
          <th>Source Page</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {leads.map((lead) => (
          <tr key={lead.id}>
            <td>{lead.id}</td>
            <td>{lead.name}</td>
            <td>{lead.email}</td>
            <td>{lead.country}</td>
            <td>{lead.phone}</td>
            <td>{lead.message}</td>
            <td>{lead.form_type}</td>
            <td>{lead.source_page}</td>
            <td>
              <button onClick={() => onEdit(lead)}>Edit</button>
       
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}