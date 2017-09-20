import {Component, ElementRef, ViewChild, Inject} from '@angular/core';
import {DataSource} from '@angular/cdk/collections';
import {MdPaginator, MdSort, SelectionModel, MdDialog, MdDialogRef, MD_DIALOG_DATA} from '@angular/material';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/debounceTime';

@Component({
  selector: 'tas-period-schedule',
  templateUrl: './period-schedule.component.html',
  styleUrls: ['./period-schedule.component.css']
})
export class PeriodScheduleComponent {

    displayedColumns = ['checkbox', 'name', 'trainer', 'backupTrainer', 'classroom', 'day', 'startTime', 'endTime', 'capacity', 'allParticipantList', 'action'];
    exampleDatabase = new ExampleDatabase();
    selection = new SelectionModel<string>(true, []);
    dataSource: ExampleDataSource | null;
    
    @ViewChild(MdPaginator) paginator: MdPaginator;
    @ViewChild(MdSort) sort: MdSort;
    @ViewChild('filter') filter: ElementRef;
    
    ngOnInit() {
      this.dataSource = new ExampleDataSource(this.exampleDatabase, this.paginator, this.sort);
      Observable.fromEvent(this.filter.nativeElement, 'keyup')
        .debounceTime(150)
        .distinctUntilChanged()
        .subscribe(() => {
          if (!this.dataSource) { return; }
          this.dataSource.filter = this.filter.nativeElement.value;
        });
    }
    
      isAllSelected(): boolean {
        if (!this.dataSource) { return false; }
        if (this.selection.isEmpty()) { return false; }
    
        if (this.filter.nativeElement.value) {
          return this.selection.selected.length == this.dataSource.renderedData.length;
        } else {
          return this.selection.selected.length == this.exampleDatabase.data.length;
        }
      }
    
      masterToggle() {
        if (!this.dataSource) { return; }
    
        if (this.isAllSelected()) {
          this.selection.clear();
        } else if (this.filter.nativeElement.value) {
          this.dataSource.renderedData.forEach(data => this.selection.select(data.id));
        } else {
          this.exampleDatabase.data.forEach(data => this.selection.select(data.id));
        }
      }
    }
    
    const EMPLOYEENAMES = ['aaa', 'bbb', 'ccc', 'ddd', 'eee'];
    
    export interface UserData {
      id: string;
      name: string;
      trainer: string;
      backupTrainer: string;
      classroom: string;
      day: string;
      startTime: string;
      endTime: string;
      capacity: string;
      allParticipantList: string;
    }
    
    export class ExampleDatabase {
      dataChange: BehaviorSubject<UserData[]> = new BehaviorSubject<UserData[]>([]);
      get data(): UserData[] { return this.dataChange.value; }
    
      constructor() {
        for (let i = 0; i < 100; i++) { this.addUser(); }
      }
    
      addUser() {
        const copiedData = this.data.slice();
        copiedData.push(this.createNewUser());
        this.dataChange.next(copiedData);
      }
    
      private createNewUser() {
        return {
          id: (this.data.length + 1).toString(),
          name: EMPLOYEENAMES[Math.round(Math.random() * (EMPLOYEENAMES.length - 1))],
          trainer: EMPLOYEENAMES[Math.round(Math.random() * (EMPLOYEENAMES.length - 1))],
          backupTrainer: EMPLOYEENAMES[Math.round(Math.random() * (EMPLOYEENAMES.length - 1))],
          classroom: EMPLOYEENAMES[Math.round(Math.random() * (EMPLOYEENAMES.length - 1))],
          day: EMPLOYEENAMES[Math.round(Math.random() * (EMPLOYEENAMES.length - 1))],
          startTime: EMPLOYEENAMES[Math.round(Math.random() * (EMPLOYEENAMES.length - 1))],
          endTime: EMPLOYEENAMES[Math.round(Math.random() * (EMPLOYEENAMES.length - 1))],
          capacity: EMPLOYEENAMES[Math.round(Math.random() * (EMPLOYEENAMES.length - 1))],
          allParticipantList: EMPLOYEENAMES[Math.round(Math.random() * (EMPLOYEENAMES.length - 1))]
        };
      }
    }
    
    export class ExampleDataSource extends DataSource<any> {
      _filterChange = new BehaviorSubject('');
      get filter(): string { return this._filterChange.value; }
      set filter(filter: string) { this._filterChange.next(filter); }
    
      filteredData: UserData[] = [];
      renderedData: UserData[] = [];
    
      constructor(private _exampleDatabase: ExampleDatabase,
                  private _paginator: MdPaginator,
                  private _sort: MdSort) {
        super();
        
        this._filterChange.subscribe(() => this._paginator.pageIndex = 0);
      }
    
      connect(): Observable<UserData[]> {
        const displayDataChanges = [
          this._exampleDatabase.dataChange,
          this._sort.mdSortChange, 
          this._filterChange,
          this._paginator.page,
        ];
    
        return Observable.merge(...displayDataChanges).map(() => {
          this.filteredData = this._exampleDatabase.data.slice().filter((item: UserData) => {
            let searchStr = (item.trainer).toLowerCase();
            return searchStr.indexOf(this.filter.toLowerCase()) != -1;
          });
    
          const sortedData = this.sortData(this.filteredData.slice());
    
          const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
          this.renderedData = sortedData.splice(startIndex, this._paginator.pageSize);
          return this.renderedData;
        });
      }
    
      disconnect() {}
    
      sortData(data: UserData[]): UserData[] {
        if (!this._sort.active || this._sort.direction == '') { return data; }
    
        return data.sort((a, b) => {
          let propertyA: number|string = '';
          let propertyB: number|string = '';
    
          switch (this._sort.active) {
            case 'name': [propertyA, propertyB] = [a.name, b.name]; break;
            case 'trainer': [propertyA, propertyB] = [a.trainer, b.trainer]; break;
            case 'backupTrainer': [propertyA, propertyB] = [a.backupTrainer, b.backupTrainer]; break;
            case 'classroom': [propertyA, propertyB] = [a.classroom, b.classroom]; break;
            case 'day': [propertyA, propertyB] = [a.day, b.day]; break;
            case 'startTime': [propertyA, propertyB] = [a.startTime, b.startTime]; break;
            case 'endTime': [propertyA, propertyB] = [a.endTime, b.endTime]; break;
            case 'capacity': [propertyA, propertyB] = [a.capacity, b.capacity]; break;
            case 'allParticipantList': [propertyA, propertyB] = [a.allParticipantList, b.allParticipantList]; break;
          }
    
          let valueA = isNaN(+propertyA) ? propertyA : +propertyA;
          let valueB = isNaN(+propertyB) ? propertyB : +propertyB;
    
          return (valueA < valueB ? -1 : 1) * (this._sort.direction == 'asc' ? 1 : -1);
        });
      }
    }