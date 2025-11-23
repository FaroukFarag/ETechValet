import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Note } from "./domain/models/note.model";
import { NoteRepository } from "./infrastructure/data/repositories/note.repository";
import { NoteService } from "./application/services/note.service";
import { NoteController } from "./presentation/controllers/note.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Note])],
    providers: [NoteRepository, NoteService],
    controllers: [NoteController],
    exports: [NoteRepository]
})
export class NotesModule { }