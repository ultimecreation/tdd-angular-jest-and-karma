import { Injectable } from "@angular/core";
import { AbstractControl, AsyncValidator, ValidationErrors } from "@angular/forms";
import { UserService } from "../core/user.service";
import { catchError, map, Observable, of } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export default class UniqueEmailValidator implements AsyncValidator {

    constructor(private userService: UserService) { }

    validate(control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
        return this.userService.isEmailTaken(control.value).pipe(
            map((_) => (_ ? { emailInUse: true } : null)),
            catchError(() => of(null))
        )
    }

}