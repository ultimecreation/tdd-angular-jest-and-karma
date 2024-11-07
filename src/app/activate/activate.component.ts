import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../core/user.service';

@Component({
    selector: 'app-activate',
    templateUrl: './activate.component.html',
    styles: [
    ]
})
export class ActivateComponent implements OnInit {

    public activationStatus!: 'success' | 'fail'
    constructor(private activatedRoute: ActivatedRoute, private userService: UserService) { }

    ngOnInit(): void {
        this.activatedRoute.params.subscribe((params) => {
            this.userService.activate(params['id']).subscribe({
                next: () => {
                    this.activationStatus = 'success'
                },
                error: () => {
                    this.activationStatus = 'fail'
                }
            })
        })
    }

}
