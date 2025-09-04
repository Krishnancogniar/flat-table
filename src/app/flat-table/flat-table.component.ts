import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AngularGridInstance, Column, Editors, FieldType, Formatters, GridOption } from 'angular-slickgrid';

export type ColumnType = 'HIERARCHIAL' | 'PROMO' | 'AGGREGATION';

export interface FlatTableColumnMeta {
	col_header: string; // maps to field in data
	col_label: string; // "Group_Column"
	col_type: ColumnType;
	level: number; // used to sort columns asc
	editable?: boolean; // only relevant for AGGREGATION
}

@Component({
	selector: 'app-flat-table',
	templateUrl: './flat-table.component.html',
	styleUrls: ['./flat-table.component.scss']
})
export class FlatTableComponent implements OnChanges {
	@Input() metadata: FlatTableColumnMeta[] = [];
	@Input() data: Array<Record<string, any>> = [];

	columnDefinitions: Column[] = [];
	gridOptions: GridOption = {};
	dataset: Array<Record<string, any>> = [];
	angularGrid?: AngularGridInstance;

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['metadata'] || changes['data']) {
			this.buildGrid();
		}
	}

	private buildGrid(): void {
		const sortedMeta = [...(this.metadata || [])].sort((a, b) => {
			const aLevel = typeof a.level === 'number' ? a.level : Number.POSITIVE_INFINITY;
			const bLevel = typeof b.level === 'number' ? b.level : Number.POSITIVE_INFINITY;
			return aLevel - bLevel;
		});

		const columns: Column[] = [];
		let lastFrozenIndex = -1;

		for (let i = 0; i < sortedMeta.length; i++) {
			const meta = sortedMeta[i];
			const { group, name } = this.parseLabel(meta.col_label);

			const common: Partial<Column> = {
				id: meta.col_header,
				name,
				field: meta.col_header,
				columnGroup: group,
				sortable: true,
				filterable: true,
				minWidth: 90,
				width: 110
			};

			let column: Column = { ...common } as Column;

			switch (meta.col_type) {
				case 'HIERARCHIAL': {
					column = {
						...column,
						type: FieldType.string,
						frozen: true
					} as Column;
					lastFrozenIndex = i;
					break;
				}
				case 'PROMO': {
					column = {
						...column,
						type: FieldType.number,
						formatter: Formatters.decimal
					} as Column;
					break;
				}
				case 'AGGREGATION': {
					const isEditable = !!meta.editable;
					column = {
						...column,
						type: FieldType.number,
						formatter: Formatters.decimal,
						editor: isEditable ? { model: Editors.float, params: { decimalPlaces: 2 } } : undefined
					} as Column;
					break;
				}
				default: {
					column = {
						...column,
						type: FieldType.string
					} as Column;
					break;
				}
			}

			columns.push(column);
		}

		const options: GridOption = {
			enableAutoResize: true,
			autoFitColumnsOnFirstLoad: true,
			enableColumnReorder: true,
			enableSorting: true,
			enableFiltering: true,
			editable: true,
			rowHeight: 28,
			headerRowHeight: 28,
			frozenColumn: lastFrozenIndex >= 0 ? lastFrozenIndex : undefined,
			createPreHeaderPanel: true,
			showPreHeaderPanel: true,
			preHeaderPanelHeight: 28
		};

		this.columnDefinitions = columns;
		this.gridOptions = options;
		this.dataset = Array.isArray(this.data) ? this.data : [];
	}

	private parseLabel(colLabel: string): { group: string; name: string } {
		if (!colLabel) {
			return { group: '', name: '' };
		}
		const parts = String(colLabel).split('_');
		if (parts.length <= 1) {
			return { group: '', name: parts[0] };
		}
		const group = parts.shift() as string;
		const name = parts.join('_');
		return { group, name };
	}
}

