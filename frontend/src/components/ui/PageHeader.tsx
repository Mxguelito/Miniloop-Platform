import type { ReactNode } from "react";


interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}


function PageHeader({
  title,
  description,
  action,
}: PageHeaderProps) {

  return (
    <header className="page-header">

      <div className="page-header__content">
        <h1 className="page-header__title">
          {title}
        </h1>

        {description && (
          <p className="page-header__description">
            {description}
          </p>
        )}
      </div>

      {action && (
        <div className="page-header__action">
          {action}
        </div>
      )}

    </header>
  );
}


export default PageHeader;