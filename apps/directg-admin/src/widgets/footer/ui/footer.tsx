// legacy: pc/_Admin_/inc/footer.php (docs/migration/admin/layout/footer.md)
export const Footer = () => {
  // legacy: <script>document.write(new Date().getFullYear())</script>
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-6">{year} © H2 Interactive Corp All Rights Reserved.</div>
          <div className="col-md-6">
            {/* legacy: 비어 있는 footer-links 자리 */}
            <div className="text-md-end footer-links d-none d-md-block" />
          </div>
        </div>
      </div>
    </footer>
  );
};
