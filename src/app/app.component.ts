import { Component } from '@angular/core';
import { FlatTableColumnMeta } from './flat-table/flat-table.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'flat-table';
  metadata: FlatTableColumnMeta[] = [
    { col_header: 'plant', col_label: 'Static_Plant', col_type: 'HIERARCHIAL', level: 1 },
    { col_header: 'warehouse', col_label: 'Static_Warehouse', col_type: 'HIERARCHIAL', level: 2 },
    { col_header: 'sku', col_label: 'Static_SKU', col_type: 'HIERARCHIAL', level: 3 },
    { col_header: 'lifting', col_label: 'Promo_Lifting', col_type: 'PROMO', level: 10 },
    { col_header: 'custFcst', col_label: 'Forecast_Customer Forecast', col_type: 'AGGREGATION', level: 20, editable: true },
    { col_header: 'planFcst', col_label: 'Forecast_Planner Forecast', col_type: 'AGGREGATION', level: 21, editable: true },
    { col_header: 'statFcst', col_label: 'Forecast_Statistical Forecast', col_type: 'AGGREGATION', level: 22, editable: false },
    { col_header: 'finalFcst', col_label: 'Forecast_Final Consensus Forecast', col_type: 'AGGREGATION', level: 23, editable: true }
  ];

  rows = [
    { plant: 'P1', warehouse: 'W1', sku: 'SKU-1', lifting: 1200, custFcst: 100, planFcst: 105, statFcst: 98, finalFcst: 110 },
    { plant: 'P1', warehouse: 'W1', sku: 'SKU-2', lifting: 900, custFcst: 200, planFcst: 210, statFcst: 190, finalFcst: 205 },
    { plant: 'P2', warehouse: 'W3', sku: 'SKU-3', lifting: 450, custFcst: 80, planFcst: 85, statFcst: 70, finalFcst: 90 }
  ];
}
