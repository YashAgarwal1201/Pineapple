import React from 'react';
import { Dialog } from 'primereact/dialog';
import './ReusableBottomDialog.scss';

export const ReusableBottomDialog = ({
  visible,
  onHide,
  headerContent,
  bodyContent,
}: {
  visible: any;
  onHide: any;
  headerContent?: any;
  bodyContent?: any;
}) => {
  const header = (
    <div className="flex items-center gap-4 text-sm md:text-base lg:mr-4 text-[#000E1A]">
      {headerContent}
    </div>
  );

  return (
    <Dialog
      className="reusableBottomDialog absolute top-28 left-2 lg:left-auto right-2 w-auto lg:w-fit rounded-lg bg-[#F8F2F7]"
      draggable={false}
      header={header}
      visible={visible}
      onHide={() => onHide(!visible)}
    >
      {bodyContent && <div>{bodyContent}</div>}
    </Dialog>
  );
};

export default ReusableBottomDialog;
