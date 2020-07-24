var App = App || {};
App.config = App.config || {};

function diagraming(){

    'use strict';
    App.config.stencil = {};

    App.config.stencil.groups = {
        erd: { index: 1, label: 'Entity-relationship' },

    };

    App.config.stencil.shapes = {};

    App.config.stencil.shapes.erd = [

        {
            type: 'erd.Entity',
            attrs: {
                root: {
                    dataTooltip: 'Entity',
                    dataTooltipPosition: 'left',
                    dataTooltipPositionSelector: '.joint-stencil'
                },
                '.outer': {
                    rx: 3,
                    ry: 3,
                    fill: '#31d0c6',
                    'stroke-width': 2,
                    stroke: 'transparent',
                    'stroke-dasharray': '0'
                },
                text: {
                    text: '',
                    'font-size': 11,
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    fill: '#f6f6f6',
                    'stroke-width': 0
                }
            }
        },
        {
            type: 'erd.WeakEntity',
            attrs: {
                root: {
                    dataTooltip: 'Weak Entity',
                    dataTooltipPosition: 'left',
                    dataTooltipPositionSelector: '.joint-stencil'
                },
                '.outer': {
                    fill: 'transparent',
                    stroke: '#feb663',
                    'stroke-width': 2,
                    points: '100,0 100,60 0,60 0,0',
                    'stroke-dasharray': '0'
                },
                '.inner': {
                    fill: '#feb663',
                    stroke: 'transparent',
                    points: '97,5 97,55 3,55 3,5',
                    'stroke-dasharray': '0'
                },
                text: {
                    text: '',
                    'font-size': 11,
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    fill: '#f6f6f6',
                    'stroke-width': 0
                }
            }
        },
        {
            type: 'erd.Relationship',
            attrs: {
                root: {
                    dataTooltip: 'Relationship',
                    dataTooltipPosition: 'left',
                    dataTooltipPositionSelector: '.joint-stencil'
                },
                '.outer': {
                    fill: '#61549c',
                    stroke: 'transparent',
                    'stroke-width': 2,
                    'stroke-dasharray': '0'
                },
                text: {
                    text: '',
                    'font-size': 11,
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    fill: '#f6f6f6',
                    'stroke-width': 0
                }
            }
        },
        {
            type: 'erd.Key',
            attrs: {
                root: {
                    dataTooltip: 'Key',
                    dataTooltipPosition: 'left',
                    dataTooltipPositionSelector: '.joint-stencil'
                },
                '.outer': {
                    fill: 'transparent',
                    stroke: '#fe854f',
                    'stroke-dasharray': '0'
                },
                '.inner': {
                    fill: '#fe854f',
                    stroke: 'transparent',
                    display: 'block',
                    'stroke-dasharray': '0'
                },
                text: {
                    text: '',
                    'font-size': 11,
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    fill: '#f6f6f6',
                    'stroke-width': 0
                }
            }
        },
        {
            type: 'erd.IdentifyingRelationship',
            attrs: {
                root: {
                    dataTooltip: 'Identifying Relationship',
                    dataTooltipPosition: 'left',
                    dataTooltipPositionSelector: '.joint-stencil'
                },
                '.outer': {
                    fill: 'transparent',
                    stroke: '#6a6c8a',
                    'stroke-dasharray': '0'
                },
                '.inner': {
                    fill: '#6a6c8a',
                    stroke: 'transparent',
                    'stroke-dasharray': '0'
                },
                text: {
                    text: '',
                    'font-size': 11,
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    fill: '#f6f6f6',
                    'stroke-width': 0
                }
            }
        },
        {
            type: 'erd.Normal',
            attrs: {
                root: {
                    dataTooltip: 'Normal',
                    dataTooltipPosition: 'left',
                    dataTooltipPositionSelector: '.joint-stencil'
                },
                '.outer': {
                    fill: '#feb663',
                    stroke: 'transparent',
                    'stroke-dasharray': '0'
                },
                text: {
                    text: '',
                    'font-size': 11,
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    fill: '#f6f6f6',
                    'stroke-width': 0
                }
            }
        },
        {
            type: 'erd.Derived',
            attrs: {
                root: {
                    dataTooltip: 'Derived',
                    dataTooltipPosition: 'left',
                    dataTooltipPositionSelector: '.joint-stencil'
                },
                '.outer': {
                    fill: 'transparent',
                    stroke: '#fe854f',
                    'stroke-dasharray': '0'
                },
                '.inner': {
                    fill: '#feb663',
                    stroke: 'transparent',
                    'display': 'block',
                    'stroke-dasharray': '0'
                },
                text: {
                    text: '',
                    fill: '#f6f6f6',
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    'font-size': 11,
                    'stroke-width': 0
                }
            }
        }
    ];
}
