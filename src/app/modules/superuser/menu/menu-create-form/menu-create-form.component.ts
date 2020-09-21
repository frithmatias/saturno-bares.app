import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { MenuResponse, MenuItem } from '../../superuser.interface';
import { FormGroup, FormControl, Validators, FormGroupDirective, FormArray } from '@angular/forms';
import { SharedService } from '../../../../services/shared.service';
import { LoginService } from '../../../../services/login.service';
import { SuperuserService } from '../../superuser.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AjaxError } from 'rxjs/ajax';
import { of } from 'rxjs';

@Component({
  selector: 'app-menu-create-form',
  templateUrl: './menu-create-form.component.html',
  styleUrls: ['./menu-create-form.component.css']
})
export class MenuCreateFormComponent implements OnInit {
  @Input() idMenuSelected: string;
  @Input() itemEdit: MenuItem;
  @Output() itemUpdated: EventEmitter<MenuItem> = new EventEmitter();

  menuForm: FormGroup;
  constructor(
    private loginService: LoginService,
    private sharedService: SharedService,
    private superuserService: SuperuserService
  ) { }

  ngOnInit(): void {
    this.menuForm = new FormGroup({
      id_parent: new FormControl(null, Validators.required),
      cd_role: new FormControl(null, Validators.required),
      cd_pricing: new FormControl(null, Validators.required),
      tx_titulo: new FormControl(null, Validators.required),
      tx_icon: new FormControl(null, Validators.required),
      tx_url: new FormControl(null, Validators.required),
      // ar_submenu: new FormArray([])
    });

  }

  ngOnChanges(changes: SimpleChanges) {
   
    if(changes.idMenuSelected) {
      this.menuForm?.patchValue({id_parent: this.idMenuSelected});
    }

    if (changes.itemEdit){
      this.menuForm?.patchValue({
        cd_role: changes.itemEdit.currentValue.cd_role,
        cd_pricing: changes.itemEdit.currentValue.cd_pricing,
        tx_titulo: changes.itemEdit.currentValue.tx_titulo,
        tx_icon: changes.itemEdit.currentValue.tx_icon,
        tx_url: changes.itemEdit.currentValue.tx_url
      })
    }
    
    // const submenuArray = <FormArray>this.menuForm?.get('ar_submenu');
    // const submenuArray = <FormArray>new FormArray([]);
    // this.itemEdit?.ar_submenu.forEach(x => {
    //   submenuArray.push(new FormGroup({
    //     cd_pricing: new FormControl(x.cd_pricing, Validators.required),
    //     tx_titulo: new FormControl(x.tx_titulo, Validators.required),
    //     tx_icon: new FormControl(x.tx_icon, Validators.required),
    //     tx_url: new FormControl(x.tx_url, Validators.required),
    //   }));
    // });
  }

  createMenu(formDirective: FormGroupDirective) {
    this.menuForm?.patchValue({id_parent: this.idMenuSelected});

    if (this.menuForm.invalid) {
      this.sharedService.snackShow('Formulario invalido', 2000);
      return;
    }

    const menu: any = {
      id_parent: this.menuForm.value.id_parent,
      cd_role: this.menuForm.value.cd_role,
      cd_pricing: this.menuForm.value.cd_pricing,
      tx_titulo: this.menuForm.value.tx_titulo,
      tx_icon: this.menuForm.value.tx_icon,
      tx_url: this.menuForm.value.tx_url,
    } 

    if (this.itemEdit) {

      menu._id = this.itemEdit._id;
      this.superuserService.updateMenu(menu).subscribe((data: MenuResponse) => {
        if (data.ok) {
          this.itemUpdated.emit(data.menuitem);
          this.sharedService.snackShow(data.msg, 5000);
          this.resetForm(formDirective);
        }
      }, (err: HttpErrorResponse) => {
        this.sharedService.snackShow(err.error.msg, 5000);
      })
    } else {
      this.superuserService.createMenu(menu).subscribe((data: MenuResponse) => {
        this.itemUpdated.emit(data.menuitem);
        this.sharedService.snackShow(data.msg, 5000);
        this.resetForm(formDirective);
        formDirective.resetForm();
      }, (err: HttpErrorResponse) => {
        this.sharedService.snackShow(err.error.msg, 5000);
      }
      )
    }
  }

  manejaError = (err: AjaxError) => {
    return of<AjaxError>(err);
  }

  resetForm(formDirective: FormGroupDirective) {
    this.itemEdit = null;
    this.menuForm.enable();
    this.menuForm.reset();
    formDirective.resetForm();
    this.sharedService.scrollTop();
  }
}
