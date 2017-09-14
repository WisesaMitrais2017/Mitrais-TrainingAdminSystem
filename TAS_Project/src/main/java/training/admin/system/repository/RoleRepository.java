package training.admin.system.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;

import training.admin.system.model.Role;

@Component
public interface RoleRepository extends JpaRepository<Role, Long>{
	
}
