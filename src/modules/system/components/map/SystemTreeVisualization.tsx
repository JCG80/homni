
import React from 'react';
import Tree from 'react-d3-tree';
import type { SystemModule } from '../../types/systemTypes';

// Define the node structure for the D3 tree
export interface TreeNodeData {
  name: string;
  attributes?: Record<string, string>;
  children?: TreeNodeData[];
}

interface SystemTreeVisualizationProps {
  treeData: TreeNodeData | null;
  onNodeClick: (nodeData: any) => void;
}

export const SystemTreeVisualization = ({ treeData, onNodeClick }: SystemTreeVisualizationProps) => {
  // Custom node component for the tree
  const renderCustomNodeElement = ({ nodeDatum, toggleNode }: any) => {
    const isRoot = nodeDatum.name === 'System';
    const isDependency = nodeDatum.attributes?.dependency === 'true';
    
    return (
      <g>
        <circle 
          r={isRoot ? 25 : 20}
          fill={isRoot ? '#4f46e5' : isDependency ? '#d97706' : '#10b981'}
          onClick={toggleNode}
        />
        <text
          fill="white"
          x={0}
          y={0}
          textAnchor="middle"
          alignmentBaseline="middle"
          fontSize={12}
          style={{ pointerEvents: 'none' }}
        >
          {typeof nodeDatum.name === 'string' && nodeDatum.name.length > 10 
            ? `${nodeDatum.name.substring(0, 10)}...` 
            : nodeDatum.name}
        </text>
        <text
          fill="black"
          x={0}
          y={isRoot ? 40 : 35}
          textAnchor="middle"
          fontSize={11}
        >
          {nodeDatum.attributes?.id || ''}
        </text>
      </g>
    );
  };

  if (!treeData) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <p>Ingen moduldata tilgjengelig</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[500px]">
      <Tree 
        data={treeData} 
        orientation="vertical"
        onNodeClick={onNodeClick}
        renderCustomNodeElement={renderCustomNodeElement}
        translate={{ x: 300, y: 50 }}
      />
    </div>
  );
};

export const buildTreeData = (modules: SystemModule[]): TreeNodeData | null => {
  if (modules.length === 0) return null;
  
  const rootNode: TreeNodeData = {
    name: 'System',
    children: []
  };

  // Add all modules to the tree
  modules.forEach(module => {
    if (module.is_active) {
      rootNode.children?.push({
        name: module.name,
        attributes: {
          id: module.id,
          description: module.description || ''
        },
        children: []
      });
    }
  });

  return rootNode;
};

// Helper function to find a node by ID in the tree structure
export const findNodeById = (node: TreeNodeData, id: string): TreeNodeData | null => {
  if (node.attributes && node.attributes.id === id) {
    return node;
  }

  if (node.children) {
    for (const child of node.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
  }

  return null;
};
