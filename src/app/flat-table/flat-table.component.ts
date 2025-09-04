import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AngularGridInstance, Column, Editors, FieldType, Formatters, GridOption } from 'angular-slickgrid';

export type ColumnType = 'HIERARCHIAL' | 'PROMO' | 'AGGREGATION';

export interface FlatTableColumnMetaV1 {
	col_header: string; // maps to field in data
	col_label: string; // "Group_Column"
	col_type: ColumnType;
	level: number; // used to sort columns asc
	editable?: boolean; // only relevant for AGGREGATION
}

export interface FlatTableColumnMetaV2 {
	colheader: string;
	collabel: string;
	coltype: ColumnType;
	level: number;
	status?: boolean;
	display?: boolean;
	editable?: boolean;
	forecastbucket?: string[];
	forecast_bucket?: string[];
}

export type FlatTableColumnMeta = FlatTableColumnMetaV1 | FlatTableColumnMetaV2;

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
		const normalized = (this.metadata || [])
			.map(m => this.normalizeMeta(m))
			.filter(m => m && (m.display ?? true) && (m.status ?? true));

		const sortedMeta = normalized.sort((a, b) => {
			const aLevel = typeof a.level === 'number' ? a.level : Number.POSITIVE_INFINITY;
			const bLevel = typeof b.level === 'number' ? b.level : Number.POSITIVE_INFINITY;
			return aLevel - bLevel;
		});

		const columns: Column[] = [];
		let lastFrozenIndex = -1;

		for (const meta of sortedMeta) {
			const { group, name } = this.parseLabelV2(meta);

			const common: Partial<Column> = {
				id: meta.col_header,
				name,
				field: meta.col_header,
				columnGroup: group,
				sortable: true,
				filterable: true,
				minWidth: 100,
				width: 120
			};

			let column: Column = { ...common } as Column;

			switch (meta.col_type) {
				case 'HIERARCHIAL': {
					column = { ...column, type: FieldType.string, frozen: true } as Column;
					lastFrozenIndex = columns.length; // based on visible columns
					break;
				}
				case 'PROMO': {
					column = { ...column, type: FieldType.number, formatter: Formatters.decimal } as Column;
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

	angularGridReady(angularGrid: AngularGridInstance): void {
		this.angularGrid = angularGrid;
		const slickGrid = this.angularGrid?.slickGrid;
		// defer autosize to next tick to ensure DOM ready
		setTimeout(() => {
			try {
				slickGrid?.autosizeColumns();
			} catch {
				// noop
			}
		});
	}

	private parseLabelV2(meta: ReturnType<FlatTableComponent['normalizeMeta']>): { group: string; name: string } {
		const label = meta.col_label || meta.col_header;
		if (!label) return { group: '', name: '' };

		// AGGREGATION: group by the forecast type suffix found at end of label
		if (meta.col_type === 'AGGREGATION') {
			const types = ['Customer Forecast', 'Planner Forecast', 'Statistical Forecast', 'Final Consensus Forecast'];
			for (const t of types) {
				if (label.endsWith(t)) {
					const name = label.substring(0, label.length - t.length).trim();
					return { group: t, name };
				}
			}
			return { group: 'Forecast', name: label };
		}

		// PROMO: prefix groups like "Lifting Data", "Calculated Columns"
		if (meta.col_type === 'PROMO') {
			const knownPrefixes = ['Lifting Data', 'Calculated Columns'];
			for (const p of knownPrefixes) {
				if (label.startsWith(p)) {
					return { group: p, name: label.substring(p.length) };
				}
			}
			return { group: 'Promo', name: label };
		}

		// HIERARCHIAL: no group, use label directly
		return { group: '', name: label };
	}

	private normalizeMeta(meta: FlatTableColumnMeta): {
		col_header: string;
		col_label: string;
		col_type: ColumnType;
		level: number;
		display?: boolean;
		status?: boolean;
		editable?: boolean;
		forecastbucket?: string[];
	} {
		const anyMeta: any = meta as any;
		const col_header = anyMeta.col_header ?? anyMeta.colheader ?? '';
		const col_label = anyMeta.col_label ?? anyMeta.collabel ?? col_header;
		const col_type = (anyMeta.col_type ?? anyMeta.coltype) as ColumnType;
		const level = Number(anyMeta.level ?? Number.POSITIVE_INFINITY);
		const display = anyMeta.display ?? true;
		const status = anyMeta.status ?? true;
		const editable = !!(anyMeta.editable ?? false);
		const forecastbucket = anyMeta.forecastbucket ?? anyMeta.forecast_bucket ?? [];
		return { col_header, col_label, col_type, level, display, status, editable, forecastbucket };
	}
}

