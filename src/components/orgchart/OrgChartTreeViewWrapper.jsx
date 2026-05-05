'use client';
import { ReactFlowProvider } from 'reactflow';
import OrgChartTreeView from './OrgChartTreeView';

export default function OrgChartTreeViewWrapper(props) {
  return (
    <ReactFlowProvider>
      <OrgChartTreeView {...props} />
    </ReactFlowProvider>
  );
}
