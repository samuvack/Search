<?php
namespace MyApp\Entities;
/**
 * @Entity
 * @Table(name="website_groups")
 */
class Group {
	/**
	 * @Id @Column(type="integer")
	 * @GeneratedValue
	 */
	private $id;
	/** @Column(type="text") */
	private $name;
	/** @Column(type="integer") */
	private $order_legend;
	/**
	 * @OneToMany(targetEntity="Layer", mappedBy="group_id")
	 * @OrderBy({"order_legend" = "ASC"})
	 **/
	private $layers;

	public function getName() {
		return $this->name;
	}
	public function getLayers() {
		return $this->layers;
	}
}
