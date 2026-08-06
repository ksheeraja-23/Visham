import dagre from "dagre";
const graph = new dagre.graphlib.Graph();

graph.setDefaultEdgeLabel(() => ({}));

export function layoutGraph(nodes, edges) {

    graph.setGraph({

        rankdir: "TB",

        nodesep: 80,

        ranksep: 120,

    });

    nodes.forEach((node) => {

        graph.setNode(node.id, {

            width: 200,

            height: 90,

        });

    });

    edges.forEach((edge) => {

        graph.setEdge(edge.source, edge.target);

    });

    dagre.layout(graph);

    return nodes.map((node) => {

        const pos = graph.node(node.id);

        return {

            ...node,

            position: {

                x: pos.x,

                y: pos.y,

            },

        };

    });

}
